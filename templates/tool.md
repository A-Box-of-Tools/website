# {{ name }}

{{ tagline }}

> {{ description }}

{{ note }}

## {{ pledge_line }}

{{ pledge }}

{% for fact in facts %}- {{ fact }}
{% endfor %}
## {{ howto_heading }}

{% for step in howto %}{{ step.n }}. **{{ step.title }}** {{ step.body }}
{% endfor %}{% if guide %}
## {{ guide_heading }}

[{{ guide.name }}]({{ guide.url }}): {{ guide.description }}
{% endif %}{% if related %}
## {{ related_heading }}

{% for other in related %}- [{{ other.name }}]({{ other.url }}): {{ other.tagline }}
{% endfor %}{% endif %}
## {{ questions_heading }}
{% for entry in faq %}
### {{ entry.q }}

{{ entry.a }}
{% endfor %}
## {{ privacy_heading }}

{% for point in privacy %}- **{{ point.title }}** {{ point.body }}
{% endfor %}
{{ check_yourself }} {{ site.source_url }}

{{ read_first }}
