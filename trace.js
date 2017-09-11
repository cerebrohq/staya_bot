
var DEBUG_MODE = true;

function log()
{
    if (DEBUG_MODE === true && typeof console != 'undefined' && arguments.length > 0)
    {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] == 'string')
            args[0] = '>>> ' + args[0];

        console.log(args);
    }
};

function trace()
{
    if (DEBUG_MODE === true && typeof console != 'undefined' && arguments.length > 0)
    {
        var args = Array.prototype.slice.call(arguments);
                        
        var msg = "Trace";
        if (typeof args[0] == 'string')
            msg = msg + ' ' + args[0];

        console.groupCollapsed(msg);
        console.log(args);
        console.trace();
        console.groupEnd();
    }
}

module.exports.log = log;
module.exports.trace = trace;