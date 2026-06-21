# Quartz image-optimizer

This plugin grabs all image assets in your content folder and converts them to
a desired format + strips all metadata. Note that you will have to add these
ignore patterns in your config so that quartz doesn't copy the original files
to the public dir:
```yaml
  ignorePatterns:
    - "**/*.png"
    - "**/*.PNG"
    - "**/*.jpg"
    - "**/*.JPG"
    - "**/*.jpeg"
    - "**/*.JPEG"
    - "**/*.tiff"
```

Default config:
```yaml
  - source: github:xoconoch/image-optimizer
    enabled: true
    options:
      quality: 80
      effort: 4
      format: webp
      extensions:
        - jpg
        - jpeg
        - png
        - webp
        - tiff
    order: 50
```
