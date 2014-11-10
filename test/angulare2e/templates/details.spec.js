describe("E2E: person detail view", function() {

    beforeEach(function() {
        browser().navigateTo('/');
    });

    it('should show the correct person details', function() {
        browser().navigateTo('#/person/123');

        expect(element('.id').html()).toBe(
            '123'
        );
        expect(element('.lastname').html()).toBe(
            'Doe'
        );
        expect(element('.age').html()).toBe(
            '36'
        );
        expect(element('.child0').html()).toBe(
            'Mary'
        );
        expect(element('.child1').html()).toBe(
            'David'
        );
    });
});
