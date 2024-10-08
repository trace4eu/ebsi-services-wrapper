const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

const folderArray = require("./allComponentsFolder");


const sequentialExecution = async (...commands) => {

    try {


        if (commands.length === 0) {
            return 0;
        }
        console.log("execution of command: " + commands[0]);
        const { stderr, err, stdout } = await execAsync(commands.shift());
        if (stderr) {

            console.log(stderr);
            throw stderr;
        }
        if (err) {

            console.log(err);
            throw err;
        }
        console.log(stdout);

        return sequentialExecution(...commands);
    }
    catch (error) {

        return;
    }
}

// Checks for --command and if it has a value
const customIndex = process.argv.indexOf('--command');
let customValue;

if (customIndex > -1) {
    // Retrieve the value after --command
    commandValue = process.argv[customIndex + 1];
} else {
    console.log("missing --command parameter ");
    return;
}

if (commandValue.trim().length <= 0) {
    console.log("missing --command value ");
}

let commands = [];
folderArray.forEach(function (folder, index) {

    commands[index] = "npm " + commandValue + " --prefix ./" + folder;

})

sequentialExecution(...commands);

/*   // Will execute the commands in series
   sequentialExecution(
       "npm run " + commandValue + " --prefix ./signature-wrapper",
       "npm run " + commandValue + " --prefix ./authorisation-wrapper",
       "npm run " + commandValue + " --prefix ./track-and-trace-wrapper"
   ); */



