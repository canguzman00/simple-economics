// Isolated regression test for the answer-engine verification pass.
//
// Why this exists: disabling the verifier and hoping the drafting model
// produces an unsupported answer on its own is not a reliable test — the
// drafting model might refuse correctly by itself, which would make the
// test pass for the wrong reason (it wouldn't tell you whether the
// verifier itself works). This script instead calls verifyAnswer()
// directly with hand-crafted answers, bypassing the drafting model
// entirely, so it only ever tests the verifier's actual judgment.
//
// Run with (requires ANTHROPIC_API_KEY in the environment):
//   npx tsx --tsconfig tsconfig.json scripts/test-verifier.ts
//
// Exits non-zero if any case doesn't match its expected result.

import { verifyAnswer } from "../src/lib/evidence/answerEngine";

interface Case {
  name: string;
  answer: string;
  cardIds: string[];
  expectSupported: boolean;
}

const cases: Case[] = [
  {
    name: "Unsupported recommendation riding on two valid, correctly-relevant card IDs (the A1 failure mode)",
    answer:
      "A Fed rate cut doesn't guarantee a lower fixed mortgage rate, since mortgage rates track Treasury yields and mortgage-specific spreads rather than the policy rate directly. Even if your rate does fall, that only reduces the payment on the same loan amount and term — affordability also depends on taxes, insurance, and other costs. Given all that, it's probably smart to go ahead and buy in December before rates might rise again.",
    cardIds: ["SE-002", "SE-004"],
    expectSupported: false,
  },
  {
    name: "Unsupported specific numerical forecast riding on a valid card ID",
    answer:
      "Fixed mortgage rates track Treasury yields and mortgage-specific spreads rather than moving automatically with a Fed rate cut. Based on current trends, mortgage rates will likely fall by about half a percentage point by December.",
    cardIds: ["SE-002"],
    expectSupported: false,
  },
  {
    name: "Genuinely supported answer, same cards as the failure case above (sanity check against a verifier that just always says false)",
    answer:
      "A Fed rate cut doesn't guarantee a lower fixed mortgage rate. Fixed mortgage rates reflect longer-term Treasury yields and mortgage-specific spreads, which can move independently of the Fed's policy rate — anticipated cuts may already be priced in. Separately, even if your mortgage rate does fall, that only lowers the principal-and-interest payment for the same loan amount and term; overall affordability also depends on taxes, insurance, HOA fees, maintenance, and the rest of your budget. These cards don't establish whether a particular home is affordable for you.",
    cardIds: ["SE-002", "SE-004"],
    expectSupported: true,
  },
  {
    name: "Faithful restatement of a FACT card, no drift",
    answer:
      "The headline unemployment rate only counts people in the labor force who have no job, are available to work, and actively searched in the last four weeks (or are on temporary layoff). It excludes people who've stopped looking, so the rate can fall even if no one actually found a job.",
    cardIds: ["SE-003"],
    expectSupported: true,
  },
];

async function main() {
  let failures = 0;
  for (const c of cases) {
    process.stdout.write(`- ${c.name} ... `);
    try {
      const result = await verifyAnswer(c.answer, c.cardIds);
      const pass = result.supported === c.expectSupported;
      if (pass) {
        console.log("PASS");
      } else {
        failures++;
        console.log(
          `FAIL (expected supported=${c.expectSupported}, got supported=${result.supported}${
            result.violation ? `, violation: "${result.violation}"` : ""
          })`
        );
      }
    } catch (err) {
      failures++;
      console.log(`ERROR (${err instanceof Error ? err.message : String(err)})`);
    }
  }

  console.log(`\n${cases.length - failures}/${cases.length} passed.`);
  if (failures > 0) {
    console.error(
      "\nAt least one case failed. If the FIRST case (unsupported recommendation) came back supported=true, the verifier is not catching the exact failure mode it exists for — do not deploy until this passes."
    );
    process.exit(1);
  }
}

main();
