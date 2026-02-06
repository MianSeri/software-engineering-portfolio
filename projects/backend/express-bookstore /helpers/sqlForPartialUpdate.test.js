const sqlForPartialUpdate = require("./sqlForPartialUpdate");

describe("sqlForPartialUpdate", function () {
  test("works with 1 field", function () {
    const result = sqlForPartialUpdate({ pages: 300 });
    expect(result).toEqual({
      setCols: `"pages"=$1`,
      values: [300],
    });
  });

  test("works with multiple fields", function () {
    const result = sqlForPartialUpdate({ pages: 300, title: "New" });
    expect(result).toEqual({
      setCols: `"pages"=$1, "title"=$2`,
      values: [300, "New"],
    });
  });

  test("works with jsToSql mapping", function () {
    const result = sqlForPartialUpdate(
      { amazon_url: "http://a.co/x", title: "New" },
      { amazon_url: "amazon_url" }
    );

    expect(result).toEqual({
      setCols: `"amazon_url"=$1, "title"=$2`,
      values: ["http://a.co/x", "New"],
    });
  });

  test("throws error with no data", function () {
    expect(() => sqlForPartialUpdate({})).toThrow();
  });
});