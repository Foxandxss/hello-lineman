HelloLineman::Application.routes.draw do
  namespace :api do
    resources :languages
  end
end
