# {{ heading }}

{{ lede }}

{{ url }}
{% for category in categories %}
## {{ category.name }}

{{ category.note }}

{% for tool in category.tools %}- [{{ tool.name }}]({{ tool.url }}): {{ tool.tagline }}
{% endfor %}{% endfor %}
{{ guides_note }}

{{ roadmap_note }}

## {{ privacy_heading }}

{{ privacy_lede }}

{% for point in guarantees %}- **{{ point.title }}** {{ point.body }}
{% endfor %}
{{ guarantees_note }}

## {{ support_heading }}

{{ support_note }}

[{{ support_text }}]({{ support_url }})
