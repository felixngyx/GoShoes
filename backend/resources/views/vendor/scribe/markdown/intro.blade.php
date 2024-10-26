@php
    use Knuckles\Scribe\Tools\Utils as u;
@endphp
# {{ u::trans("scribe::headings.introduction")  }}<img src="{{ asset("docs/images/logo.png") }}" class="logo-pop" alt="">

<style>
    .logo-pop {
        width: 10%;
        max-width: 20px;
        margin: 0 auto;
        display: block;
    }
</style>

{!! $description !!}

<aside>
    <strong>{{ u::trans("scribe::labels.base_url") }}</strong>: <code>{!! $baseUrl !!}</code>
</aside>

{!! $introText !!}

