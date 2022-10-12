---
layout: base
title: Site news
pagination:
  data: collections.posts
  size: 10
  reverse: true
  alias: posts
---

<section id="content" class="body">
	<h1>Articles</h1>
	<hr/>
	<ol id="posts-list" class="hfeed">
		{%- for post in pagination.items -%}
		<li {% if page.url == post.url %} aria-current="page"{% endif %}>
			<article class="hentry">
				<header>
					<h1>
						<a href="{{ post.url }}">{{ post.data.title }}</a>
					</h1>
				</header>
				<div class="entry-content">
					<footer class="post-info">
						<abbr class="published">{{ post.data.date | postDate }}</abbr>
						<address class="vcard author">By <a href="#">{{ post.data.author }}</a></address>
					</footer>
					<p>{{ post.data.post_excerpt }}..</p>
					<a class="readmore" href="{{ post.url }}">read more</a>
				</div>
			</article>
		</li>
		{%- endfor -%}
	</ol>
</section>