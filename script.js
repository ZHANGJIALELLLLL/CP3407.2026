function submitPost() {

    let post =
        document.getElementById("postContent").value;

    if(post === "") {
        alert("Please enter a post.");
        return;
    }

    document.getElementById("message").innerHTML =
        "Post submitted anonymously!";
}