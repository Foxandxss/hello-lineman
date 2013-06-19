/* Define custom server-side HTTP routes for lineman's development server
 *   These might be as simple as stubbing a little JSON to
 *   facilitate development of code that interacts with an HTTP service
 *   (presumably, mirroring one that will be reachable in a live environment).
 *
 * It's important to remember that any custom endpoints defined here
 *   will only be available in development, as lineman only builds
 *   static assets, it can't run server-side code.
 *
 * This file can be very useful for rapid prototyping or even organically
 *   defining a spec based on the needs of the client code that emerge.
 *
 */

module.exports = {

    drawRoutes: function(app) {
    //   app.get('/api/languages', function(req, res) {
    //   	var out = [
    //   		{
    //   			id: 1,
    //   			name: "Javascript"
    //   		},
    //   		{
    //   			id: 2,
    //   			name: "Python"
    //   		},
    //   		{
    //   			id: 3,
    //   			name: "C#"
    //   		},
    //   		{
    //   			id: 1,
    //   			name: "Java"
    //   		}
    //   	]

  		// res.json(out);
    //   })
    }
};