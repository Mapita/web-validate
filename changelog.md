# v0.4.1

Eleventh release. 21 April 2021.

- Numeric validators now coerce BigInts when not set to strict.

# v0.4.0

Eleventh release. 16 April 2021.

- Add a "bigint" default validator.
- Update dependency versions.

# v0.3.4

Tenth release. 2 July 2020.

- Object and list validators now coerce JSON strings when not set to strict.

# v0.3.3

Ninth release. 23 September 2019.

- Fix missing default argument for the "strict" function.
- Improve behavior of "copyWithSensitive" for object inputs.

# v0.3.2

Eighth release. 20 August 2019.

- Fix issue with "main" path in package.json.

# v0.3.1

Seventh release. 20 August 2019.

- String validator now normalizes unicode.
- Fix accidentally uninformative error messages for some inputs.

# v0.3.0

Sixth release. 22 January 2019.

- Converted source to TypeScript; package now includes TS definitions.

# v0.2.0

Fifth release. 14 September 2018.

- "email" default validator no longer converts to lowercase
- "email" validator now trims whitespace from the input when set to permissive

# v0.1.3

Fourth release. 24 June 2018.

- Remove log lines used to debug previous release. (d'oh)

# v0.1.2

Third release. 24 June 2018.

- Fix a typo in list and string error description text.
- Fix an issue when using copyWithoutSensitive on nullable lists and objects.
- Fix an issue when using copyWithoutSensitive on a list without an "each" specification.

# v0.1.1

Second release. 24 June 2018.

- Fix an issue when using string specifications for attributes of an object.
- Clearer error messages when the most common API functions receive too few arguments.

# v0.1.0

First release. 22 June 2018.
