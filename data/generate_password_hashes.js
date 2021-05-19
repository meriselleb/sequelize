
const jqCsv = require('jquery-csv');
const fs = require('fs')
const bCrypt = require('bcrypt-nodejs')
const salt = bCrypt.genSaltSync(8);

var hash = (password) => bCrypt.hashSync(password, salt, null);

var otherUserDataFn = "./users_commented_on_posts_by_top_100_users.csv"
var otherUserData = jqCsv.toObjects(fs.readFileSync(otherUserDataFn, 'utf-8'))

var hashes = []

for (var i = 0; i < otherUserData.length; ++i) {
    var otherUser = otherUserData[i];
    var nameStr = otherUser.DisplayName.split(" ").join("").toLowerCase();
    hashes.push(hash(nameStr));
    process.stdout.write(`\r${i}/${otherUserData.length}`);
}

fs.writeFileSync('hashed_passwords.txt', hashes.join("\n"));