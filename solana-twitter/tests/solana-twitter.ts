import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaTwitter } from "../target/types/solana_twitter";
import * as assert from "assert";


describe("solana-twitter", () => {
  // Configure the client to use the local cluster.
  //const provider = anchor.Provider.local("http://127.0.0.1:8899"); 
  //anchor.setProvider(provider); 
  //console.log(provider.wallet.publicKey);
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.SolanaTwitter as Program<SolanaTwitter>;
  console.log(program)

  it('can send a new tweet', async () => {
    // Before sending the transaction to the blockchain.


    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('TOPIC HERE', 'CONTENT HERE', {
        accounts: {
            // Accounts here...
            tweet: tweet.publicKey,
            author: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [
          	// Key pairs of signers here...
            tweet
        ],
    });

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'TOPIC HERE');
    assert.equal(tweetAccount.content, 'CONTENT HERE');
    assert.ok(tweetAccount.timestamp);
  });

  it('can send a new tweet without a topic', async () => {
    // Before sending the transaction to the blockchain.


    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('', 'CONTENT HERE', {
        accounts: {
            // Accounts here...
            tweet: tweet.publicKey,
            author: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [
          	// Key pairs of signers here...
            tweet
        ],
    });

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    assert.equal(tweetAccount.topic, '');
    assert.equal(tweetAccount.content, 'CONTENT HERE');
    assert.ok(tweetAccount.timestamp);
  });

  it('can send a new tweet from a different author', async () => {
    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
    await program.provider.connection.confirmTransaction(signature);

    // Call the "SendTweet" instruction on behalf of this other user.
    const tweet = anchor.web3.Keypair.generate();
    await program.rpc.sendTweet('veganism', 'Yay Tofu!', {
        accounts: {
            tweet: tweet.publicKey,
            author: otherUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [otherUser, tweet],
    });

    // Fetch the account details of the created tweet.
    const tweetAccount = await program.account.tweet.fetch(tweet.publicKey);

    // Ensure it has the right data.
    assert.equal(tweetAccount.author.toBase58(), otherUser.publicKey.toBase58());
    assert.equal(tweetAccount.topic, 'veganism');
    assert.equal(tweetAccount.content, 'Yay Tofu!');
    assert.ok(tweetAccount.timestamp);
  });

  it('cannot provide a topic with more than 50 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const topicWith51Chars = 'x'.repeat(51);
    try {
      await program.rpc.sendTweet(topicWith51Chars, 'Hummus, am I right?', {
          accounts: {
              tweet: tweet.publicKey,
              author: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [tweet],
      });
    } catch (e) {
      assert.equal(e.msg, 'The provided topic should be 50 characters long maximum.');
      return;
    }
    assert.fail('The instruction should have failed with a 51-character topic.');
  });

  it('cannot provide a content with more than 280 characters', async () => {
    const tweet = anchor.web3.Keypair.generate();
    const topicWith51Chars = 'x'.repeat(281);
    try {
      await program.rpc.sendTweet('veganizm', topicWith51Chars, {
          accounts: {
              tweet: tweet.publicKey,
              author: program.provider.wallet.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [tweet],
      });
    } catch (e) {
      assert.equal(e.msg, 'The provided content should be 280 characters long maximum.');
      return;
    }
    assert.fail('The instruction should have failed with a 281-character content.');
  });


});
