'use strict';

describe('Service: PeopleDataService', function () {

    var PeopleDataService;
    var PeopleDBService;

    // load the application module
    beforeEach(module('bbUI'));

    // get a reference to the service
    beforeEach(inject(function (_PeopleDBService_, _PeopleDataService_) {
        PeopleDBService = _PeopleDBService_;
        PeopleDataService = _PeopleDataService_;
    }));

    describe('Public API', function() {
        it('should include a getDBXml() function', function () {
            expect(PeopleDBService).to.exist;
            expect(PeopleDBService.getDBXml).to.exist;
        });

        it('should include a getPerson() function', function () {
            expect(PeopleDataService).to.exist;
            expect(PeopleDataService.getPerson).to.exist;
        });
    });

    describe('Public API usage', function() {
        describe('getPerson()', function() {
            var db;

            it('should return the xml database', function() {
                db = PeopleDBService.getDBXml();
                expect(db).to.exist;
            });

            it('should return the first person', function() {
                var person = PeopleDataService.getPerson(db, "123");
                expect(person).to.exist;
                expect(person.id).to.equal("123");
                expect(person.firstname).to.equal("John");
                expect(person.lastname).to.equal("Doe");
                expect(person.age).to.equal("36");
                expect(person.children).to.deep.equal(["Mary", "David"]);
            });

            it('should return the second person', function() {
                var person = PeopleDataService.getPerson(db, "126");
                expect(person).to.exist;
                expect(person.id).to.equal("126");
                expect(person.firstname).to.equal("Larry");
                expect(person.lastname).to.equal("Savoy");
                expect(person.age).to.equal("32");
                expect(person.children).to.deep.equal(["Mar", "Savage"]);
            });
        });
    });
});
