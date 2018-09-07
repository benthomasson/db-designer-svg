
function serialize(message) {
    return JSON.stringify([message.constructor.name, message]);
}
exports.serialize = serialize;

function Undo(sender, original_message) {
    this.msg_type = "Undo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Undo = Undo;

function Redo(sender, original_message) {
    this.msg_type = "Redo";
    this.sender = sender;
    this.original_message = original_message;
}
exports.Redo = Redo;

function MultipleMessage(sender, messages) {
    this.msg_type = "MultipleMessage";
    this.sender = sender;
    this.messages = messages;
}
exports.MultipleMessage = MultipleMessage;
