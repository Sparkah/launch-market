// Create (or load) the Launch Market Sui registry keypair.
// The secret is written to .sui_registry.key (gitignored). The public address
// goes to sui_registry.json (tracked) and is where candidate receipt objects
// are sent on-chain via Walrus `send_object_to`.
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const KEYFILE = '.sui_registry.key';
const PUBFILE = 'sui_registry.json';

let kp;
if (existsSync(KEYFILE)) {
  kp = Ed25519Keypair.fromSecretKey(readFileSync(KEYFILE, 'utf8').trim());
} else {
  kp = new Ed25519Keypair();
  writeFileSync(KEYFILE, kp.getSecretKey(), { mode: 0o600 });
}

const address = kp.getPublicKey().toSuiAddress();
const out = {
  address,
  network: 'testnet',
  account_explorer: `https://suiscan.xyz/testnet/account/${address}`,
  object_explorer: 'https://suiscan.xyz/testnet/object/',
};
writeFileSync(PUBFILE, JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out));
