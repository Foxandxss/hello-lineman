HelloLineman::Application.routes.draw do
  namespace :api do
    resources :languages
  end

  root to: "application#index"

  match '*path', to: "application#index"
end
