window.onload = function() {

	var editPhotoEl = document.querySelector('.editPhotoEl');


	$('.editPhotoEl').click(function(event) {
		event.preventDefault();
		var destination = $(this).attr('href');
		console.log('destination', destination);

		$.ajax({
			method: "GET",
			url: "/public/js/editFormModal",
			dataType: "html"
		}).success(function(data) {
			$('.editFormModalContainer').append(data);
			$('#editFormModalButton').click();
		});

	});



}