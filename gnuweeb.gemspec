# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name     = "GNU/Weeb"
#  spec.version  = ""
#  spec.authors  = ""
#  spec.email    = ""

  spec.summary  = ""
  spec.homepage = "https://gnuweeb.org"
  spec.license  = "BSD-3-Clause"

  spec.metadata["plugin_type"] = "theme"

  spec.files = `git ls-files -z`.split("\x0").select do |f|
    f.match(%r!^(assets|_(includes|layouts)/|(LICENSE|README)((\.(txt|md|markdown)|$)))!i)
  end

  spec.add_runtime_dependency "jekyll", ">= 3.5", "< 5.0"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.1"

  spec.add_development_dependency "bundler"
end
