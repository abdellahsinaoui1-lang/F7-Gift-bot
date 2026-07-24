const { MessageEmbed } = require('discord.js');
const Discord = require("discord.js");
require('dotenv').config();
const client = new Discord.Client({
  intents: 3276799,
  partials: [
      "CHANNEL",
      "GUILD_MEMBER",
      "GUILD_SCHEDULED_EVENT",
      "MESSAGE",
      "REACTION",
      "USER"
  ],
  failIfNotExists: false
});
const express = require("express");
const fs = require("fs");

const app = express();
var listener = app.listen(process.env.PORT || 2000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.listen(() => console.log("I'm Ready To Work..! 24H"));
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center>
  </body>`);
});

client.on('ready', () => {
  console.log(`✅ | Logged in as ${client.user.tag}`);
});

let vipKeys = JSON.parse(fs.readFileSync("./vipKeys.json", "utf8"));
let giftKeys = {};
let devs = ["1435960918352859186"];
let prefix = "!";

client.on('messageCreate', async msg => { 
  if (msg.author.bot || !msg.content.startsWith(prefix)) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'gift') {
    if (!devs.includes(msg.author.id)) {
      const embed = new MessageEmbed()
        .setColor("#42f4f4")
        .setTitle(`:x: - انت لاتمتلك الصلاحية`);
      return msg.reply({ embeds: [embed] });
    }

    const roleW = msg.mentions.roles.first();
    if (!roleW) {
      const embed = new MessageEmbed()
        .setColor("#42f4f4")
        .setTitle(`:x: - منشن الرتبة \`${prefix}gift <@admin-role>\``);
      return msg.reply({ embeds: [embed] });
    }

    const role = msg.guild.roles.cache.find(r => r.name === roleW.name);
    if (!role) {
      const embed = new MessageEmbed()
        .setColor("#42f4f4")
        .setTitle(`:x: - Could't find \`${roleW.name}\` role.`);
      return msg.reply({ embeds: [embed] });
    }

    const embed = new MessageEmbed()
      .setColor("#42f4f4")
      .setTitle(`:ok_hand: - **تم ارسآل الكود على الخاص**`);
    await msg.reply({ embeds: [embed] });

    const gift = generateKey(16);
    vipKeys[gift] = role;
    giftKeys[gift] = role;

    const embed2 = new MessageEmbed()
      .setAuthor(msg.author.username, msg.author.displayAvatarURL({ dynamic: true }))
      .setThumbnail(msg.author.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "**Key Of Gift**", value: gift, inline: true },
        { name: "Role", value: giftKeys[gift].name, inline: true },
        { name: "This Key Made by", value: msg.author.toString(), inline: true },
        { name: "The Room", value: msg.channel.toString(), inline: true }
      )
      .setTimestamp()
      .setFooter(client.user.username, client.user.displayAvatarURL({ dynamic: true }));

    await msg.author.send({ embeds: [embed2] });
    save();
  } else if (cmd === 'use') {
    const key = args[0];

    if (!key) {
      const embed = new MessageEmbed()
        .setColor("#42f4f4")
        .setTitle(`:x: - **الرجاء ادخال كود الهدية** \`${prefix}use <Key>\``);
      return msg.reply({ embeds: [embed] });
    }

    if (vipKeys[key]) {
      const role = msg.guild.roles.cache.find(role => role.name === vipKeys[key].name);
      console.log(role);
      if (msg.member.roles.cache.has(role.id)) {
        const embed = new MessageEmbed()
          .setTitle(`:x: - **انت تمتلك هذه الرتبة مسبقًا**  \`${vipKeys[key].name}\``)
          .setColor("#42f4f4");
        return msg.channel.send({ embeds: [embed] });
      }

      const embed = new MessageEmbed()
        .setTitle(`:tada: - **مبروك تم اعطائك رتبة** \`${vipKeys[key].name}\``)
        .setColor("#42f4f4");
      await msg.channel.send({ embeds: [embed] });

      await msg.member.roles.add(role)
        .catch(console.error);

      delete vipKeys[key];
      save();
    } else {
      const embed = new MessageEmbed()
        .setTitle(`:x: - **الكود غير صيحيح أو انه مستعمل من قبل**`)
        .setColor("#42f4f4");
      msg.channel.send({ embeds: [embed] });
    }
  }
});

function generateKey(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

function save() {
  fs.writeFile("./vipKeys.json", JSON.stringify(vipKeys), err => {
    if (err) console.error(err);
  });
}

client.login(process.env.TOKEN);
