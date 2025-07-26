import ping from './/utility/ping';
import flipTable from './fliptable';
import unflip from './unflip';
import diag from './diag';
import textOptionCommand from './text-option';
import ephemeralConfirm from './ephemeral-confirm';
import aestheticTest from './aesthetic-test';
import aestheticProd from './aesthetic-prod';

let commands = [
  ping, flipTable, unflip, diag,
  textOptionCommand, ephemeralConfirm,
  aestheticTest, aestheticProd,
];

export default commands;
