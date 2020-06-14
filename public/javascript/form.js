$('#zip').change(function() {
  $.post("/", {
      zip: $('#zip').val(),
    })
    .done(function(data) {
        $('#city').val(data.city);
        $('#state').val(data.state);
    });
});
