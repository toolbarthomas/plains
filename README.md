# Plains

Build modular interfaces for the web.

## Stylesheets

### Postcs Maps

You can also define Postcss variables trough external YAML files.
All YAML files that exists within the same directory of the entry stylesheet will be made available for Postcss.

The defined configuration can be accessed with the Postcss helper `map($filename, $key...)`.
Where the first paramater: `$filename` should match the name of the given YAML file and the \$key parameter will be the actual key to use.

Exposing configuration objects through YAML files for Postcss uses the [postcss-map](https://github.com/pascalduez/postcss-map) plugin.

**For example:**

_Configuration:_

```yml
regular:
  font-family: "'Spinnaker Regular', sans-serif"
```

_Input:_

```css
body {
  font-family: map('typography', 'regular', 'font-family');
}
```

_Output:_

```css
body {
  font-family: 'Spinnaker Regular', sans-serif;
}
```

## SVG sprites

Plains has the option to generate a SVG sprite for each template.
A SVG sprite will be created from each directory if it any SVG files
defined within the `PLAINS_RESOURCES_DIRNAME`.
