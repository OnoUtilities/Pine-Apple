/**
 * PineApple - JavaScript Code Management System
 * @author Import-Python
 * @version 0.1.0
 */


const fs = require('fs');
const path = require('path');
const requireFromString = require('require-from-string');
const { NodeVM } = require('vm2');
const uuidv4 = require('uuid/v4');


const splitAt = index => x => [x.slice(0, index), x.slice(index)]

const replaceAll = function (str, find, replace) {
    return str.replace(new RegExp(find, 'ig'), replace);
}
const walkSync = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            if (file.split(".")[1] == "js") {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};
const getAllIndexes = (str, word) => {
    var regexp = new RegExp(`${word}`, 'ig')
    var match, matches = [];

    while ((match = regexp.exec(str)) != null) {
        matches.push(match.index);
    }
    return matches
}

const PineApple = {}

class Logging {
    constructor() {
        this.chrome = false
        this.prefix = ` ${this.colorText("green", "Pine")}${this.colorText("yellow", "Apple")} |`
    }
    setPrefix(color, word) {
        if (this.chrome == true) {
            this.prefix = "[" + word + "] "
        } else {
            this.prefix = " " + this.colorText(color, word) + " |"
        }
    }
    inChrome() {
        this.chrome = true
    }
    colorText(color, text) {
        if (this.chrome == false) {
            switch (color) {
                case 'black':
                    text = '\x1B[30m' + text; break;
                case 'red':
                    text = '\x1B[31m' + text; break;
                case 'green':
                    text = '\x1B[32m' + text; break;
                case 'yellow':
                    text = '\x1B[33m' + text; break;
                case 'blue':
                    text = '\x1B[34m' + text; break;
                case 'magenta':
                    text = '\x1B[35m' + text; break;
                case 'cyan':
                    text = '\x1B[36m' + text; break;
                case 'white':
                    text = '\x1B[37m' + text; break;
                default:
                    text = color + text; break;
            }
            return text + '\x1B[39m' + '\x1b[0m';
        }
        return text
    };
    log(message, color = "green") {
        if (this.chrome == false) {
            message = `${this.prefix} ${this.colorText(color, message)}`
            console.log(message)
        } else {
            message = `${this.prefix} %c${message}`
            let css = `color: ${color};`
            setTimeout(console.log.bind(console, message, css), 0);
        }
    }
    info(message) {
        if (this.chrome == false) {
            message = `${this.prefix} ${this.colorText("cyan", message)}`
            console.log(message)
        } else {
            message = `${this.prefix} %c${message}`
            let css = `color: cyan;`
            setTimeout(console.log.bind(console, message, css), 0);
        }

    }
    error(message) {
        if (this.chrome == false) {
            message = `${this.prefix} ${this.colorText("red", message)}`
            console.log(message)
        } else {
            message = `${this.prefix} %c${message}`
            let css = `color: red;`
            setTimeout(console.log.bind(console, message, css), 0);
        }
    }
}

class Chunks {
    constructor() {
        this.data = {}
        this.instance = {}
        this.handler = {}
    }
    cut() {
        for (let data in this.data) {
            let self = this.data[data]
            if (self.enabled == true) {
                let runtime = self.runtime
                this.instance[self.chunk.id] = new runtime()

            }
        }
    }
    start(id, arg = null) {
        for (let data in this.data) {
            let self = this.data[data]
            if (self.chunk.id == id) {
                let runtime = self.runtime
                if (arg != null) {
                    this.instance[self.chunk.id] = new runtime(arg)
                } else {
                    this.instance[self.chunk.id] = new runtime()
                }
            }
        }
    }
    add(data) {
        if (data.chunk != null && data.runtime != null) {
            this.data[data.chunk.id] = data
            this.data[data.chunk.id].uuid = replaceAll(uuidv4(), "-", "")
            if (data.handler != null) {
                this.handler[data.chunk.id] = data.handler
            }
        }
    }
    list() {
        for (let instance in this.instance) {
            PineApple.Logging.log(instance)
        }
    }
    getList() {
        return this.data
    }
    getRuntime(id) {

    }
    getInstance(id) {
        for (let data in this.data) {
            if (this.data[data].chunk.id == id && this.instance[id] != null) {
                return this.instance[id]
            }
        }
        return null;
    }
    getChunk(name) {
        for (let data in this.data) {
            if (this.data[data].chunk.id == name) {
                return this.data[data]
            }
        }
        return null
    }
    getHandler(name) {
        for (let data in this.data) {
            let chunk = this.data[data]
            if (chunk.id == name && this.handler[chunk.id] != null) {
                return this.handler[chunk.id]
            }
        }
        return null
    }
}

class Stem {
    constructor() {
        this.allStems = {}
        this.exportedStems = {}
    }
    add(directory, id, settings) {
        console.log(id)
        console.log(name)
        if (this.allStems[id] == null) {
            let data = {}
            data.id = id
            data.settings = settings
            data.directory = directory
            data.uuid = replaceAll(uuidv4(), "-", "")
            this.allStems[id] = data
            this.exportedStems[id] = {}
        }
    }
    export(id, name, instance) {
        console.log(id)
        console.log(name)
        this.exportedStems[id][name] = new instance()
    }
    getStem(id, name) {
        if (this.exportedStems[id][name] != null) {
            return this.exportedStems[id][name]
        }
    }
    getStemList(id) {
        return this.exportedStems[id] 
    }
    listAllStems() {
        return this.allStems
    }
}
class Complier {
    constructor() {
        this.chunksUsed = {}
    }
    getChunksUsed(id) {
        if (this.chunksUsed[id] != null) {
            return this.chunksUsed[id]
        }
        return null
    }
    compileCode(directory, id, code, settings) {
        this.chunksUsed[id] = {}
        code = this._use(id, code, settings)
        code = this._import(id, code, settings)
        code = this._export(id, code)
        return code
    }
    hasPermssion(permission, settings) {
        if (settings.permissions != null) {
            for (let p in settings.permissions) {
                if (settings.permissions[p] == "*") {
                    return true
                }
                if (settings.permissions[p] == permission) {
                    return true
                }
            }
            return false
        }
        return false
    }
    _import(id, code, settings) {
        let chunks = PineApple.Chunks.getList()
        for (let chunk in chunks) {
            if (this.hasPermssion(chunk, settings)) {
                let matches = getAllIndexes(code, `import "${chunk}"`)
                if (matches.length > 0) {
                    code = replaceAll(code, `import "${chunk}"`, "")
                    code = this._encode(id, code, chunk, settings)
                }
            } else {
            }
        }
        code = replaceAll(code, `import "`, `var _ = "`)
        return code

    }
    _encode(id, code, chunk, settings, checked = null) {
        let chunks = PineApple.Chunks.getList()
        main:
        for (let c in chunks) {
            if (checked != null) {
                for (let used in checked) {
                    if (c == used) {
                        continue main
                    }
                }
            } else {
                checked = {}
                checked[`${chunk}`] = chunk
            }
            let matches = getAllIndexes(c, chunk)
            if (matches.length > 0) {
                checked[c] = c
                code = this._encode(id, code, c, settings, checked)
            }
        }
        this.chunksUsed[id][chunk] = chunk
        if (chunks[chunk].handler != null) {
            let uuid = replaceAll(uuidv4(), "-", "")
            code = replaceAll(code, `extends ${chunk}`, `extends __${uuid}__`)
            let invaildMatches = getAllIndexes(code, "__\\.")
            if (invaildMatches.length > 0) {
                PineApple.Logging.error("Invaild Chunk")
            }
            code = this._handler(chunks[chunk], uuid, settings) + "\n" + code

        } else {
            //
        }
        return code
    }
    _handler(chunk, uuid, settings) {
        let prefix = "\\$"
        if (settings.handlerSyntax != null) {
            prefix = settings.handlerSyntax
        }
        let code = chunk.handler.toString()
        code = replaceAll(code, "class handler", `class __${uuid}__`)
        let mainUUID = `_${chunk.uuid}_.`
        code = replaceAll(code, prefix, mainUUID)
        return code
    }
    _export(id, code) {
        let matches = getAllIndexes(code, "export class ")
        for (let match in matches) {
            let name = ""
            for (let i = (matches[match] + 13); i < (code.length); i++) {
                if (code.charAt(i) != " ") {
                    name = name + code.charAt(i)
                } else {
                    break
                }
            }
            let custom = `\n_export("${id}", "${name.toUpperCase()}", ${name})\n`
            code = code + custom
        }
        code = replaceAll(code, "export ", "")
        return code
    }
    _use(id, code, settings) {
        let stems = PineApple.Stem.listAllStems()
        for (let stem in stems) {
            let data = stems[stem]
            let matches = getAllIndexes(code, `use\\("${data.id}"\\)`)
            if (matches.length > 0) {
                if (this._checkStem(stem.id, data)) {
                    code = replaceAll(code, `use\\("${data.id}"\\)`, `__${data.uuid}__`)
                }
            }
        }
        return code
    }
    _checkStem(id, self) {
        let stems = PineApple.Stem.listAllStems()
        for (let stem in stems) {
            if (stem.id == id) {
                let data = stems[stem]
                if (data.directory = self.directory) {
                    return true
                } else {
                    if (stem.lock == false) {
                        return true
                    }
                }
            }
        }
        return false
    }
}
class Handler {
    constructor() {
        this.files = {}
        this.instance = {}
        this.stems = {}
        this.vm = {}
    }
    createVM(directory, settings) {
        if (settings.vm == null) {
            settings.vm = {
                console: 'off',
                sandbox: {},
            }
        }
        this.vm[directory] = new NodeVM(settings.vm);
    }
    loadChunk(id, file, settings) {
        let me = this
        let Chunk = {}
        Chunk.id = id
        Chunk.settings = settings
        let customConsole = {}
        customConsole.log = (message) => {
            PineApple.Logging.log(`[CHUNK][${id}][MAIN] ${message}`)
        }
        customConsole.error = (message) => {
            PineApple.Logging.error(`[CHUNK][${id}][MAIN] ${message}`)
        }
        customConsole.print = (message) => {
            console.log(message)
        }
        this.files[id] = file

        let text = fs.readFileSync(file, 'utf8');
        let code = `module.exports = function (PineApple, Chunk, console) {${text}}`


        try {
            me.instance[id] = requireFromString(code)
            me.instance[id](PineApple, Chunk, customConsole)
        } catch (e) {
            let line = e.stack.split("\n")[0].split(":")[1]
            let code = e.stack.split("\n")[1].trim()
            customConsole.error(`Error on line ${line} in file ${file}: \n\t\t${code}\n`)
            PineApple.Core.totalChunks--
        }
    }
    loadStem(directory, id, file, settings) {
        let me = this
        let text = fs.readFileSync(file, 'utf8');
        let code = PineApple.Complier.compileCode(directory, id, text, settings) //.data and .chunks
        let version = "1.0.0"
        let uuidChunkList = ""
        let runtimeChunkList = ""


        let _export = (id, name, instance) => {
            PineApple.Stem.export(id, name, instance)
        }

        let chunkRuntime = {}

        let Stem = {}
        Stem.log = (message) => {
            PineApple.Logging.log(`[STEM][${id}] ${message}`, "magenta")
        }
        Stem.error = (message) => {
            PineApple.Logging.error(`[STEM][${id}] ${message}`)
        }
        Stem.print = (message) => {
            console.log(message)
        }


        for (let c in PineApple.Complier.getChunksUsed(id)) {
            let chunk = PineApple.Chunks.getChunk(c)
            let uuid = `_${chunk.uuid}_`
            uuidChunkList = uuidChunkList + `${uuid}, `
            chunkRuntime[c] = PineApple.Chunks.getInstance(c)
            runtimeChunkList = runtimeChunkList + `chunkRuntime["${c}"], `
            let Chunk = {}

        }
        uuidChunkList = uuidChunkList + "console"
        runtimeChunkList = runtimeChunkList + "Stem"

        ///////////////////
        let stems = PineApple.Stem.listAllStems()

        let stemRuntime = {}
        let uuidStemList = ""
        let runtimeStemList = ""
        for (let stem in stems) {
            let data = stems[stem]
            stemRuntime[data.id] = PineApple.Stem.getStemList(data.id)
            //console.log(PineApple.Stem.getStemList(data.id))
            runtimeStemList = runtimeStemList + `, stemRuntime["${data.id}"]`
            uuidStemList = uuidStemList + `, __${data.uuid}__`
        }

        ///////////////
        let vmCode = `module.exports = function(_export, ${uuidChunkList}${uuidStemList}) { ${code} }`
        console.log(vmCode)
        let run = this.vm[directory].run(vmCode);
        let doRun = `run(_export, ${runtimeChunkList}${runtimeStemList})`
        eval(doRun)
    }
}

class Core {
    constructor() {
        this.totalChunks = 0

        this.totalStems = 0
    }
    useChunks(directory, settings) {
        let files = walkSync(directory)
        for (let file in files) {
            this.totalChunks++
            let f = files[file]
            f = f.replace(/\\/g, "/");

            let id = splitAt(f.lastIndexOf("/"))(f)[0]
            id = replaceAll(id, "/", ".").toUpperCase()
            PineApple.Handler.loadChunk(id, `${f}`, settings)
        }
    }
    enableChunks() {
        PineApple.Logging.info(`Loaded ${this.totalChunks} chunk(s)`)
        PineApple.Chunks.cut()
    }
    useStem(directory, settings) {
        console.log(directory)
        PineApple.Handler.createVM(directory, settings)
        let files = walkSync(directory)
        let folder = ""
        if (settings.base != null) {
            console.log("FOLDFER")
            folder = directory.replace(/\\/g, "/");
            folder = splitAt(folder.lastIndexOf("/"))(folder)[0]
            folder = splitAt(folder.lastIndexOf("/"))(folder)[1]
            folder = replaceAll(folder, "/", "")
        }
        for (let file in files) {
            this.totalStems++
            let f = files[file]
            let id = ""
            if (settings.base != null) {
                f = f.replace(/\\/g, "/");
                id = splitAt(f.lastIndexOf(folder))(f)[1]
                id = splitAt(id.lastIndexOf("/"))(id)[0]
                id = replaceAll(id, "/", ".").toUpperCase()
            } else {
                f = f.replace(/\\/g, "/");
                id = splitAt(f.lastIndexOf("/"))(f)[0]
                id = replaceAll(id, "/", ".").toUpperCase()
            }
            PineApple.Stem.add(directory, id, settings)
        }
        for (let file in files) {
            this.totalStems++
            let f = files[file]
            let id = ""
            if (settings.base != null) {
                f = f.replace(/\\/g, "/");
                id = splitAt(f.lastIndexOf(folder))(f)[1]
                id = splitAt(id.lastIndexOf("/"))(id)[0]
                id = replaceAll(id, "/", ".").toUpperCase()
            } else {
                f = f.replace(/\\/g, "/");
                id = splitAt(f.lastIndexOf("/"))(f)[0]
                id = replaceAll(id, "/", ".").toUpperCase()
            }
            PineApple.Handler.loadStem(directory, id, `${f}`, settings)
        }
    }
}
PineApple.Logging = new Logging()
PineApple.Chunks = new Chunks()
PineApple.Stem = new Stem()
PineApple.Handler = new Handler()
PineApple.Complier = new Complier()
PineApple.Core = new Core()
module.exports = PineApple