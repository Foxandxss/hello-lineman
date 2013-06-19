module Api
	class LanguagesController < ApplicationController
		respond_to :json

		def index
			respond_with Language.all, root: false
		end

		def create
			@lang = Language.create(params[:language])
			render json: @lang, root: false
		end
	end	
end