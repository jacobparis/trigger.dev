import { TriggerClient } from "@trigger.dev/sdk";
import { triggerClient } from "./trigger";

const clients: TriggerClient[] = [];

const possibleKeys = [
  "TRIGGER_API_KEY",
  "TRIGGER_API_KEY_2",
  "TRIGGER_API_KEY_3",
  "TRIGGER_API_KEY_4",
  "TRIGGER_API_KEY_5",
  "TRIGGER_API_KEY_6",
  "TRIGGER_API_KEY_7",
  "TRIGGER_API_KEY_8",
  "TRIGGER_API_KEY_9",
];

for (let i = 0; i < possibleKeys.length; i++) {
  if (process.env[possibleKeys[i]]) {
    clients.push(
      new TriggerClient({
        id: "perf",
        apiKey: process.env[possibleKeys[i]],
        apiUrl: process.env.TRIGGER_API_URL,
      })
    );
  }
}

async function sendEvent() {
  try {
    return await triggerClient.sendEvent({
      name: "perf.test",
      payload: {
        string: "Hello, World!",
        number: 42,
        boolean: true,
        nullValue: null,
        array: [1, 2, 3],
        object: {
          nestedString: "Nested value",
          nestedNumber: 3.14,
          nestedArray: ["apple", "banana", "cherry"],
          nestedObject: {
            nestedBoolean: false,
            nestedNull: null,
          },
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
}

async function sendEvents(count: number) {
  const events = new Array(count).fill({
    name: "perf.test",
    payload: {
      string: "Hello, World!",
      number: 42,
      boolean: true,
      nullValue: null,
      array: [1, 2, 3],
      object: {
        nestedString: "Nested value",
        nestedNumber: 3.14,
        nestedArray: ["apple", "banana", "cherry"],
        nestedObject: {
          nestedBoolean: false,
          nestedNull: null,
        },
      },
    },
  });
  try {
    return await Promise.all(clients.reverse().map((client) => client.sendEvents(events)));
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  console.log("Preparing perf tests...");

  // wait for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("Starting perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 5 events per second for 30 seconds (1 event == 10 runs)
  for (let i = 0; i < 30; i++) {
    console.log("Sending 5 event...");

    await sendEvent();
    await sendEvent();
    await sendEvent();
    await sendEvent();
    await sendEvent();

    await new Promise((resolve) => setTimeout(resolve, 950));
  }

  // console.log("Sending 30 events...");
  // for (let i = 0; i < 30; i++) {
  //   await sendEvent();
  // }
}

async function mainParallel() {
  const batches = 30;
  const concurrentEvents = 5;

  console.log("Preparing perf tests...");

  // wait for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Starting perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 5 events per second for 30 seconds (1 event == 10 runs)
  for (let i = 0; i < batches; i++) {
    console.log(`Sending ${concurrentEvents} events... batch ${i + 1}/${batches}`);
    await Promise.all(new Array(concurrentEvents).fill(0).map(sendEvent));

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function mainParallelBulk() {
  const batches = 1;
  const concurrency = 10;
  const eventsPer = 10;

  console.log("Preparing perf tests...");

  // wait for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Starting perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 5 events per second for 30 seconds (1 event == 10 runs)
  for (let i = 0; i < batches; i++) {
    console.log(`Sending ${concurrency} x ${eventsPer} events... batch ${i + 1}/${batches}`);
    await Promise.all(new Array(concurrency).fill(0).map(() => sendEvents(eventsPer)));

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function mainLong() {
  console.log("Preparing long perf tests...");

  // wait for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("Starting long perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 1 events every 5 seconds for 30 minutes
  for (let i = 0; i < 360; i++) {
    console.log("Sending 1 events...");

    await sendEvent();

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

async function mainSerial() {
  console.log("Preparing serial perf tests...");

  // wait for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("Starting serial perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 25 events
  for (let i = 0; i < 25; i++) {
    await sendEvent();
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function mainConcurrency() {
  const batches = 1;
  const concurrency = 10;
  const eventsPer = 5;

  console.log("Preparing perf tests...");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Starting perf tests in 1 second...");

  // wait for 1 seconds
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Send 5 events per second for 30 seconds (1 event == 10 runs)
  for (let i = 0; i < batches; i++) {
    console.log(`Sending ${concurrency} x ${eventsPer} events... batch ${i + 1}/${batches}`);
    await Promise.all(new Array(concurrency).fill(0).map(() => sendEvents(eventsPer)));

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function mainSingle() {
  await sendEvent();
}

mainConcurrency().catch((err) => {
  console.error(err);
  process.exit(1);
});
