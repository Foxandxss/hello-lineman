# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)
Language.delete_all

Language.create!(name: "Javascript")
Language.create!(name: "Ruby")
Language.create!(name: "Python")
Language.create!(name: "C#")
Language.create!(name: "C++")