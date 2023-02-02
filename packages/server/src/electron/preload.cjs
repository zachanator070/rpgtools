const _require = require("esm")(module);

process.once('loaded', () => {
    global.require = _require;
    console.log(document.scripts);
    [...document.scripts]
        .filter( s=> s.type === "esm" )
        .map( s => {
            console.log(s.textContent);
            _require.fromString(s.textContent);
        });
});