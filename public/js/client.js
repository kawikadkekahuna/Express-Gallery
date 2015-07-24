window.onload = function() {
	console.log("jhgjjh")

	$('body').on('click', '#submitEditForm', function(event) {
		event.preventDefault();
		var self = $(this)
		var id = $('#photoId').val();
		var url = '/gallery/' + id;

		var requestData = $('#editFormModalId').serialize();


		console.log('requestData',requestData);
		console.log('id',id);
		console.log('url',url);

		$.ajax({
			type:"POST",
			url: url,
			data: requestData,
			success: renderEditPage
		})

		$('#editPhotoModal').foundation('reveal', 'close');




	});

	// $('#editFormModalId').submit(function(event) {

	// });

};

function renderEditPage(formOptions){
	$('.photoAuthor').html(formOptions.author);
	var image = $('.photoImg').css('background-image','url('+formOptions.link+')');
	$('.photoImg').css('background-image',image);	
	$('.photoDescHolder').html(formOptions.description);
}