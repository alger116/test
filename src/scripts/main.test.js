const { JSDOM } = require("jsdom");
const { attachEventListener } = require("./main");

// Mock the DOM
const dom = new JSDOM(`
  <html>
    <body>
      <button id="testButton">Click me</button>
    </body>
  </html>
`);

global.document = dom.window.document;

test("attachEventListener should attach an event listener to the button", () => {
  const mockHandler = jest.fn();
  attachEventListener("testButton", mockHandler);

  const button = document.getElementById("testButton");
  button.click();

  expect(mockHandler).toHaveBeenCalled();
});

test("hello world!", () => {
  expect(1 + 1).toBe(2);
});
