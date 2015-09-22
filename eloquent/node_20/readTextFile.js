var fs = require("fs");
fs.readFile("file.txt", "utf8", function(error, text) {
    if (error)
        throw error;
    console.log("The file contained:", text);
});
