# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name     = "GNUWeeb"
  spec.version  = "0.8" # Based on revision branch, include this.
  spec.authors  = "GNU/Weeb Contributors (https://github.com/GNUWeeb/www.gnuweeb.org/graphs/contributors)"
  # spec.email    = ""

  spec.summary  = "We are working to build community through Open Source technology"
  spec.homepage = "https://gnuweeb.org"
  spec.license  = "BSD-3-Clause"

  spec.files = `git ls-files -z`.split("\x0").select do |f|
    f.match(%r!^(assets|_(includes|layouts)/|(CODE_OF_CONDUCT|LICENSE|README)((\.(txt|md|markdown)|$)))!i)
  end

  spec.add_runtime_dependency "jekyll", "~> 4.2.0"
  spec.add_runtime_dependency "jekyll-seo-tag", "~> 2.7.1"
  spec.add_runtime_dependency "jekyll-sitemap", "~> 1.4.0"
  spec.add_runtime_dependency "jekyll-feed", "~> 0.15.1"
  # spec.add_runtime_dependency "bootstrap", "~> 5.1.0"  # In the future


  spec.add_development_dependency "bundler"
end
