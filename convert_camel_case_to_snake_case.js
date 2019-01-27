let testFolder = [];

const fs = require('fs');

const testAnnotationString = '@Test';

process.argv.forEach(function (val, index, array) {
    if (index >= 2) {
        testFolder.push(val);
    }
});

function getFiles(dir, files_) {
    files_ = files_ || [];
    let files = fs.readdirSync(dir);
    for (let i in files) {
        let name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            changeFileMethodName(name);
            files_.push(name);
        }
    }
    return files_;
}

function changeToSnakeCase(camelCaseMethod) {
    const camelCaseString = camelCaseMethod.substring(
        camelCaseMethod.indexOf("void") + 4,
        camelCaseMethod.indexOf("()")
    ).trim();
    const snakeCaseString = camelCaseString.split('').map((character) => {
        if (/[A-Z]/.test(character)) {
            return `_${character.toLowerCase()}`;
        }
        return character;
    }).join('');

    const snakeCaseMethod = camelCaseMethod.replace(camelCaseString, snakeCaseString);
    return snakeCaseMethod;
}

function changeFileMethodName(file) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        if (!data.includes(testAnnotationString)) {
            return;
        }
        const result = data.split(testAnnotationString).map((method, index) => {
            if (index !== 0) {
                return changeToSnakeCase(method);
            }
            return method;
        }).join(testAnnotationString);

        fs.writeFile(file, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
}

console.log('start converting');

testFolder.forEach(getFiles);

console.log('convert success!');
