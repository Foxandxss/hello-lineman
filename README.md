An example of Rails + Lineman + Frontend
========================================

We used to always develope integrating our frontend inside Rails' assets. It worked but we lost all the flexibility of having an independent frontend application.

So what we need to do is use a tool like [Lineman](http://www.linemanjs.com) to build our frontend without any knowledge of what kind of backend we are going to use.

If you want to learn more about using `Lineman` I highly recommend you to see [David Mosher](http://www.youtube.com/watch?v=fSAgFxjFSqY) video.

### Getting started

So you want to make an app and you know that is going to use a framework like `Angular`, `Backbone` or `Ember` but you have so far no idea about what backend. Not a problem!

Let's create a directory for our application:

```
$ mkdir hello-lineman
$ cd hello-lineman
```

And then we create our lineman application:

```
[hello-lineman]$ lineman new frontend
```

Please visit [Lineman](http://www.linemanjs.com) web to get started with it.

Note that the lineman app doesn't need to be called *frontend*.

If you want you can get some pre-configured templates for lineman:

* [Backbone.js](https://github.com/davemo/lineman-backbone-template) template.
* [Angular.js](https://github.com/davemo/lineman-angular-template) template.
* [Ember.js](https://github.com/searls/lineman-ember-template) template.

In case you want some of them, just clone it. For example, instead of the last command, you can use:

```
$ git clone https://github.com/davemo/lineman-angular-template.git frontend
```

And that is it! You can now work with your frontend application as much as you want.

### Rails integration

So you decided to use `Rails` as a backend. There are several ways to integrate it, and here is mine:

```
[hello-lineman]$ rails new .
```

That will create a Rails app in the current directory, so the *frontend* folder is inside the Rails application.

They don't know each other and they don't care.

We do it this way because it will be a lot easier to deploy (more on this later).

Now it is the time to build our great *REST Api*.

Then in the lineman application, you configure the proxy server (as the lineman documentation says) and you're good to go.

### Rails configuration

Since our frontend and our backend are completely separated, we need to configure Rails to use the frontend properly.

The idea is that the frontend should be 100% portable, so if tomorrow we decide that we don't want Rails anymore, we can dump the frontend into another backend without **any** change at all.

First, since we are not using the *CSRF meta tag* that Rails provides (remember, our index.html shouldn't contain any code of the backend) we need a way to ask Rails for a *CSRF* token and then use it.

If you saw David Mosher's video, you see that what he does is to request the *CSRF* token from the server when the application starts and then inject it into Angular.

That is easy to do with Rails, something along the lines:

```ruby
class CsrfController < ApplicationController
  def csrf_token
    render json: {csrf_token: form_authenticity_token}
  end
end
```

Haven't tried but it should work :).

Ideally, this is the way to go but I thought that having to do an extra request and the need of manually injecting the *csrf_token* in the request is not ideal so I decided to break the rules and gives the backend some knowledge of the frontend.

Reading through Angular's [$http](http://docs.angularjs.org/api/ng.$http) documentation I saw this:

> The $http service reads a token from a cookie called XSRF-TOKEN and sets it as the HTTP header X-XSRF-TOKEN. Since only JavaScript that runs on your domain could read the cookie, your server can be assured that the XHR came from JavaScript running on your domain.

That means that we can have *Rails* create a cookie with the *CSRF token* and *Angular* will automagically read it and set the *HTTP Header*. How?

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery

  after_filter  :set_csrf_cookie_for_ng  

  protected

  def set_csrf_cookie_for_ng
    cookies['XSRF-TOKEN'] = form_authenticity_token if protect_against_forgery?
  end

  def verified_request?
    super || form_authenticity_token == request.headers['X_XSRF_TOKEN']
  end
end
```

With that, when we make our first *GET*, the cookie will be set and Angular will save the *CSRF token* into a header. The advantage is that you don't need to write any code in Angular.

Another thing you maybe want is *HTML 5 mode*. Lineman supports it (Look [here](https://github.com/testdouble/lineman#html5-pushstate-simulation)), but we need to do some workarounds to get it working in Rails.

First, you need to serve your `index.html` using a Rails controller, like this:

```ruby
def index
  render file: Rails.root.join("public/index.html"), layout: false
end
```

and then:

```ruby
root to: "application#index"

match '*path', to: "application#index"
```

## Deployment

For deployment I use `Capistrano`. I am not an expert so I expect pull requests optimizing my deploy file.

I will put it part by part:

```ruby
set :rvm_ruby_string, ENV['GEM_HOME'].gsub(/.*\//,"")

before 'deploy:setup', 'rvm:create_gemset' # only create gemset
after "deploy:finalize_update", "bundle"

desc "Install the bundle"
task :bundle do
  run "bundle install --gemfile #{release_path}/Gemfile --without development test"
end

require 'rvm/capistrano'
```

This part will be run before setup and after we update our app. This will create a rvm gemset for our project (will use the same gemset as our .rvmrc).

Then:

```ruby
set :application, "app-name"
set :use_sudo, false
set :scm, :git
set :repository,  "git@github.com:User/#{application}.git"

server "example.com", :app, :web, :db, primary: true

set :user, "www-data"
set :deploy_to, "/your/server/www-root/path/#{application}"
set :deploy_via, :remote_cache

default_run_options[:pty] = true
```

And finally:

```ruby
namespace :deploy do
  task :setup_config, roles: :app do
    run "mkdir -p #{shared_path}/config"
    top.upload("config/thin.yml", "#{shared_path}/config/thin.yml")
    top.upload("config/database.yml", "#{shared_path}/config/database.yml")
    top.upload(".rvmrc", "#{shared_path}/.rvmrc")
    puts "Edit your configs at #{shared_path}"
  end

  after "deploy:setup", "deploy:setup_config"

  task :symlink_config, roles: :app do
    run "ln -nfs #{shared_path}/config/thin.yml #{release_path}/config/thin.yml"
    run "ln -nfs #{shared_path}/config/database.yml #{release_path}/config/database.yml"
    run "ln -nfs #{shared_path}/.rvmrc #{release_path}/.rvmrc"
  end

  after "deploy:finalize_update", "deploy:symlink_config"

  desc "Make sure local git is in sync with remote."
  task :check_revision, roles: :web do
    unless `git rev-parse HEAD` == `git rev-parse origin/master`
      puts "WARNING: HEAD is not the same as origin/master"
      puts "Run `git push` to sync changes."
      exit
    end
  end
  before "deploy", "deploy:check_revision"

  namespace :frontend do

    task :update do
      run "cd #{current_path}/frontend && npm install && lineman build"
      run "rm -rf #{shared_path}/public && mkdir #{shared_path}/public"
      run "mv #{current_path}/frontend/dist/* #{shared_path}/public"
      run "cd #{current_path}/frontend && lineman clean"
    end

    task :symlink_config do
      run "ln -nfs #{shared_path}/public/js #{current_path}/public/js"
      run "ln -nfs #{shared_path}/public/css #{current_path}/public/css"
      run "ln -nfs #{shared_path}/public/img #{current_path}/public/img"
      run "ln -nfs #{shared_path}/public/index.html #{current_path}/public/index.html"
    end

    after "deploy:frontend:update", "deploy:frontend:symlink_config"
  end
end
```

Well, I have a task which uploads my local *thin.yml* which is not in the repository (for obvious reasons). Since it is not in the repository, I have it locally in my app.
It also uploads the databaes config and my .rvmrc.

I make some symlinks and we are ready to go (with the Rails app).

For the frontend, I have a task which installs our app dependences and builds the app. Then it moves the result into the /public folder and cleans the Lineman app. And then, it creates some symlinks to make the Rails app aware of how the statics files are.

You can use this like this:

```
$ cap deploy:setup
$ cap deploy:update
$ cap deploy:frontend:update
```

If you're updating Rails app:

```
$ cap deploy:update
$ cap deploy:frontend:symlink_config
```

The symlinks will die if we update our rails app.

If you only want to update the frontend:

```
$ cap deploy:frontend:update
```

And that is it.