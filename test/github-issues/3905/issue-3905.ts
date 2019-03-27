import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {expect} from "chai";
import {Post} from "./entity/Post";

describe("github issues > #3905 Unexpected parsed DateTime for before A.D. 100 (e.g. \"0001-01-01 00:00:00\")", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true,
        enabledDrivers: ["mysql"]
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should parse old Date (the year of 1) correctly in mysql", () => Promise.all(connections.map(async connection => {
        const oldDateInIsoFormat = "0001-01-01T00:00:00.000Z";
        const oldDate: Date = new Date(oldDateInIsoFormat);

        const post: Post = new Post();
        post.id = 1;
        post.dateTimeColumn = oldDate;

        await connection.manager.save(post);

        const storedPost = await connection.manager.findOne(Post, post.id);
        expect(storedPost).to.not.be.null;
        expect(storedPost!.dateTimeColumn.toISOString()).to.be.equal(oldDateInIsoFormat);
    })));

    it("should parse old Date (the year of 13) correctly in mysql", () => Promise.all(connections.map(async connection => {
        const oldDateInIsoFormat = "0013-01-01T00:00:00.000Z";
        const oldDate: Date = new Date(oldDateInIsoFormat);

        const post: Post = new Post();
        post.id = 1;
        post.dateTimeColumn = oldDate;

        await connection.manager.save(post);

        const storedPost = await connection.manager.findOne(Post, post.id);
        expect(storedPost).to.not.be.null;
        expect(storedPost!.dateTimeColumn.toString()).to.not.be.equal("Invalid Date");
    })));
});
