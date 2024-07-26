import {
  collection,
  db,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "../firebase.js";

const params = new URLSearchParams(window.location.search);
const fileId = params.get("fileId");
console.log("requested fileId ===> ", fileId);

const loader = document.getElementById("loader");
const notFound = document.getElementById("not-found");
const notPublic = document.getElementById("not-public");
const fileFound = document.getElementById("file-found");
const thankYou = document.getElementById("thank-you");

if (!fileId) {
  loader.classList.add("hidden");
  notFound.classList.remove("hidden");
}

const q = query(collection(db, "fb_files"), where("id", "==", fileId));

const unsub = onSnapshot(doc(db, "fb_files", fileId), (d) => {
  const doc = { ...d.data(), id: d.id };
  console.log(doc);
  if (doc.fullPath) {
    if (doc.isPublic) {
      loader.classList.add("hidden");
      fileFound.classList.remove("hidden");
      notFound.classList.add("hidden");
      thankYou.classList.add("hidden");
      notPublic.classList.add("hidden");
      console.log("File found");
      fileFound.innerHTML = `
    
    <div class="flex flex-col items-center justify-center">
          <div class="card bg-base-100 w-96 shadow-xl">
            <figure class="px-10 pt-10">
              <img
                src="/assets/file-icon.png"
                alt="file icon"
                class="rounded-xl size-16"
              />
            </figure>
            <div class="card-body items-center text-center">
              <h2 class="card-title">${doc.name.split("__")[0]}</h2>
              <p>
              
              File Size: ${(doc.size / 1024).toFixed(2)} KB
              
              </p>
              <div class="card-actions">
                <button class="btn btn-primary" id="download-btn">
                  Download
                </button>
               
              </div>
            </div>
          </div>
        </div>
    
    `;

      document
        .getElementById("download-btn")
        .addEventListener("click", async (e) => {
          const fileUrl = doc.url;
          // alert("Downloading the file...");
          e.target.disabled = true;
          e.target.innerText = "Downloading...";
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = doc.name.split("__")[0];
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          alert("File downloaded successfully!");

          loader.classList.add("hidden");
          notFound.classList.add("hidden");
          notPublic.classList.add("hidden");
          fileFound.classList.add("hidden");
          thankYou.classList.remove("hidden");
        });
    } else {
      loader.classList.add("hidden");
      notPublic.classList.remove("hidden");
      fileFound.classList.add("hidden");
      thankYou.classList.add("hidden");
      notFound.classList.add("hidden");
      console.log("File is not public");
    }
  } else {
    loader.classList.add("hidden");
    notFound.classList.remove("hidden");
    thankYou.classList.add("hidden");
    notPublic.classList.add("hidden");
    fileFound.classList.add("hidden");
    console.log("No file found");
  }
});

{
  /* <script>
document
  .getElementById("download-btn")
  .addEventListener("click", function () {
    const fileUrl =
      "https://firebasestorage.googleapis.com/v0/b/smit-firebase-e6ef5.appspot.com/o/fb_files%2Fdownload.png__3e9d137c-0870-4486-a9ae-7904cbf7f2c7?alt=media&token=a8930458-e378-423b-8e4a-f22d3649d52d";
    fetch(fileUrl)
      .then((response) => {
        alert("Downloading the file...");
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "download.png";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert("File downloaded successfully!");
      })
      .catch(() =>
        alert("An error occurred while downloading the file.")
      );
  });
</script> */
}
