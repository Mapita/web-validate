# web-validate

*This repository is currently under construction.*

## Summary

The **web-validate** JavaScript package is an object validation tool built specifically for validating API requests to a [Node.js](https://nodejs.org/en/) server and for describing and validating the server's responses when testing. The package works especially well when used with [express](https://expressjs.com/) as [middleware](https://expressjs.com/en/guide/using-middleware.html).

In addition to validating objects against a specification, **web-validate** also provides tools for marking fields as sensitive and stripping them from an object before forwarding it to the client or to server logs.

In the near future, Mapita will also release the code we use to wrap express endpoint definitions with a full API specification. We we also eventually release a tool that can be used to generate web-friendly documentation for these wrapped endpoints.
