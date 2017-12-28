var API_KEY = 'AIzaSyDdDLNkCHEB5QaHxykT7GvmlDxpCjjcytk';

var app = new Vue({ // Initialize Vue application
	el: '#app', // Bind app to div with id="app"
	data: { // Once-loaded app data
		api_error: null,
		error: null,
		bookmark_message: null,
		faqs: [
			//{'q': 'How do you do?', 'a': 'Very well kind sir.', 'expanded': false}
		],
		spreadsheet_placeholder: 'e.g. https://docs.google.com/spreadsheets/d/12345abcdefg/edit?usp=sharing',
		spreadsheet: null,
		range: 'Form Responses 1',
		range_placeholder: 'e.g. Sheet 1 or Form Responses 1',
		column_val: '1',
		hasTitle: true,
		html_result: null,
		loading: false,
		success_gifs: 6
	},
	watch: {},
	computed: {
		column: function () { return Number(this.column_val); },
		hasResults: function () { return this.html_result !== null; },
		hasFAQ: function () { return this.faqs !== null && this.faqs.length > 0; },
		success: function () {
			var rand = Math.floor((Math.random() * this.success_gifs)) + 1;
			return "img/success_" + rand + ".gif";
		}
	},
	methods: { // Functions that can be used throughout the app
		spreadsheet_id: function () {
			if (this.spreadsheet !== null) {
				var split_url = this.spreadsheet.split('/');
				if (split_url.length < 6
					|| split_url[2].toLowerCase() !== 'docs.google.com'
					|| split_url[3].toLowerCase() !== 'spreadsheets'
					|| split_url[4].toLowerCase() !== 'd') {
					this.raise_error('Please enter a valid Google Spreadsheet URL.');
				} else { return this.spreadsheet.split('/')[5]; }
			}
			return null;
		},
		bookmark: function (event) { // Bookmarking logic
			var self = this;
			var elem = event.currentTarget;
			bookmarkPage(event, elem, function (message) {
				self.bookmark_message = message;
				Vue.nextTick(function () {
					$('#bookmark-modal').modal('show');
				});
			});
		},
		tumblr_post: function (event) {
			var url = 'http://tumblr.com/widgets/share/tool?canonicalUrl=' + encodeURIComponent(getDomain()) + '&title=TagFics&content=Automatically%20generate%20tag%20lists%20from%20Google%20Spreadsheets%20to%20use%20on%20Tumblr.' ;
			var share_window = window.open(url, 'Post to tumblr', 'height=800,width=800');
			if (window.focus) share_window.focus();
			return false;
		},
		toggle_answer: function (event) { // Show/hide answer when question is clicked on
			var question = event.currentTarget.dataset.index;
			this.faqs[question].expanded = this.faqs[question].expanded ? 
											!this.faqs[question].expanded :
											true;
		},
		privacy_show: function () { $('#privacy-modal').modal('show'); },
		faq_title: function (isExpanded) { return isExpanded ? 'Collapse answer' : 'Expand answer'; },
		submit_form: function (event) {
			event.preventDefault();
			var self = this;
			var spreadsheet_id = self.spreadsheet_id();
			if (spreadsheet_id !== null) {
				self.loading = true;
				$.ajax({
					url: 'https://sheets.googleapis.com/v4/spreadsheets/'
						+ spreadsheet_id + '/values/' + self.range,
					dataType: 'json',
					method: 'GET',
					data: { key: API_KEY, majorDimension: 'COLUMNS'},
					success: function (data) {
						self.loading = false;
						if (self.column > data.values.length - 1) {
							self.raise_error('Specified column in the spreadsheet does not have any data.'); 
						} else {
							var usernames = data.values[self.column];
							if (self.hasTitle) { usernames.shift(); };
							self.html_result = usernames.map(cleanUsername).map(tagUsername).join(' ');
						} 
					},
					error: function (error) {
						self.loading = false;
						var code = error.responseJSON.error.code;
						if (code == 404) { self.raise_error("No sheet found with this ID: " + self.spreadsheet_id); }
						else if (code == 403) { self.raise_error("No permission to access this sheet. Make sure the sheet is public/viewable for anyone with the link."); }
						else {
							var message = error.responseJSON.error.message;
							if (message.indexOf("range") !== -1) {
								self.raise_error("The spreadsheet name you entered (" + self.range + ") is incorrect. Please check your spelling/capitalization/any extra spaces.");
							} else {
								self.raise_error(message);
							}
						}
					}
				});
			}
		},
		raise_error: function (message) {
			this.error = message;
			$('#error-modal').modal('show');
		}
	}
});

function getDomain() {
	var full_url = document.location.href;
	return full_url.split('?')[0];
};

function getParameterByName(name, url) { // Get query parameter value by its name
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

function cleanUsername(username) {
	var final = $.trim(username.toLowerCase());
	if (final[0] === "@") { final = final.slice(1, final.length); }
	if (final.endsWith('.tumblr.com')) { final = final.slice(0, -11); }
	return final;
};

function tagUsername(username) {
	return '<a class="tumblelog" spellcheck="false">@'+ username +'</a>';
};
