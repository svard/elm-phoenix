# elm-phoenix
Native Phoenix channels in Elm

An implementation of [Phoenix](http://www.phoenixframework.org) channels in Elm inspired by mgold's [elm-socketio](https://github.com/mgold/elm-socketio).

The Chat example in the context of a Phoenix app can be found here https://github.com/svard/hello_phoenix.

Currently this package have not been published as an elm package so in order to use it in a project a few manual steps are required.
First the folder structure svard/elm-phoenix/2.0.0 must be created under elm-stuff/packages. Then elm-phoenix's src folder and elm-package.json file need to be copied to the newly created svard/elm-phoenix/2.0.0. Last include

```
"svard/elm-phoenix": "2.0.0 <= v < 3.0.0"
```

in elm-package.json and

```
"svard/elm-phoenix": "2.0.0"
```

in elm-stuff/exact-dependencies.json.
