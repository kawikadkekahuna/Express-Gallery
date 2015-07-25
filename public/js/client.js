window.onload = function() {
	console.log("jhgjjh")
	$('body').on('click', '#submitEditForm', editFormListener);

	$('body').on('click', '#submitLoginForm', function(event) {
		event.preventDefault();
		var requestData = $('#loginFormModalId').serialize();
		console.log('requestData', requestData);
		var url = '/login';

		$.ajax({
			method: "POST",
			url: url,
			data: requestData,
			success: renderLoginPage
		});



	});

};



function renderEditPage(formOptions) {
	$('.photoAuthor').html(formOptions.author);
	var image = $('.photoImg').css('background-image', 'url(' + formOptions.link + ')');
	$('.photoImg').css('background-image', image);
	$('.photoDescHolder').html(formOptions.description);
}

function renderLoginPage(authenticated) {
	if (authenticated) {
		$('#loginButtonEl').html('');
		$('#loginFormModal').foundation('reveal', 'close');
		$('#loginButtonEl').html('Logged In');
	}else{
		console.log('display error messages');
	}


}

function editFormListener(event) {
	event.preventDefault();
	var self = $(this)
	var id = $('#photoId').val();
	var url = '/gallery/' + id;

	var requestData = $('#editFormModalId').serialize();

	$.ajax({
		method: "POST",
		url: url,
		data: requestData,
		success: renderEditPage
	});


	$('#editPhotoModal').foundation('reveal', 'close');
}