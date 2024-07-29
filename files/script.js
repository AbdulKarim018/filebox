import {
  addDoc,
  auth,
  collection,
  db,
  deleteDoc,
  doc,
  getDownloadURL,
  onAuthStateChanged,
  onSnapshot,
  query,
  ref,
  signOut,
  storage,
  updateDoc,
  uploadBytes,
  where,
} from "../firebase.js";

const imgExtensions = [".jpg", ".png", "jpeg", "webp"];

const logout_btn = document.getElementById("logout_btn");
const user_img = document.getElementById("user_img");
const file_input = document.getElementById("file_input");
const files_table_body = document.getElementById("files_table_body");
const upload_loader = document.getElementById("upload-loader");

let globle_user = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    globle_user = user;
    console.log(user);
    console.log("User is signed in");
    user_img.removeAttribute("src");
    user_img.src = user.photoURL;
    getFiles();
  } else {
    location.pathname = "/";
    console.log("User is not signed in");
  }
});

logout_btn.addEventListener("click", async () => {
  await signOut(auth);
  console.log("User is signed out");
  location.pathname = "/";
});

file_input.addEventListener("change", async (e) => {
  const files = [...e.target.files];
  console.log(files);
  if (files.length === 0) return;

  upload_loader.classList.remove("hidden");
  const response = await Promise.all(
    files.map(async (file) => {
      const storageRef = ref(
        storage,
        `fb_files/${file.name}__${crypto.randomUUID()}`
      );
      console.log("uploading file", file.name);
      return uploadBytes(storageRef, file);
      // const url = await getDownloadURL(storageRef);
      // console.log(url);
    })
  );
  console.log("All files uploaded");
  const urls = await Promise.all(
    response.map(async (r) => {
      return getDownloadURL(r.ref);
    })
  );
  console.log(urls);
  for (let i = 0; i < response.length; i++) {
    const fileRef = response[i].ref;
    console.log(fileRef.name);
    addDoc(collection(db, "fb_files"), {
      name: fileRef.name,
      url: urls[i],
      size: files[i].size,
      isPublic: false,
      fullPath: fileRef.fullPath,
      userId: globle_user.uid,
    });
  }
  upload_loader.classList.add("hidden");
});

async function getFiles() {
  files_table_body.innerHTML = `
      <tr class="hover">
        <th><div class="flex items-center justify-center"><span class="loading loading-lg"></span></div></th>
      </tr>
      `;
  const q = query(
    collection(db, "fb_files"),
    where("userId", "==", globle_user.uid)
  );
  onSnapshot(q, (querySnapshot) => {
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ ...doc.data(), id: doc.id });
    });
    console.log(files);
    files_table_body.innerHTML = "";
    if (files.length === 0) {
      files_table_body.innerHTML = `
      <tr class="hover">
        <th>No files uploaded yet</th>
      </tr>
      `;
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      files_table_body.innerHTML += `
      
       <tr class="hover">
              <th><img  class="size-10"  src="${
                file.name.split("__")[0].split(".").pop().toLowerCase()
                  ? file.url
                  : "/assets/file-icon.png"
              }"  /></th>
              <td>${file.name.split("__")[0]}</td>
              <td>${(file.size / 1024).toFixed(2)} KB</td>
              <td>
                <div class="dropdown">
                  <div tabindex="0" role="button" class="btn btn-sm">...</div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
                  >
                    <li><a href="${file.url}" target="_blank" >Download</a></li>
                    <li><button class="public-url-copy-btn" data-file-id="${
                      file.id
                    }" >Copy Sharable Link</button></li>
                    <li><button class="text-red-400 delete-btn" data-file-fullpath="${
                      file.fullPath
                    }" data-file-id="${file.id}">Delete</button></li>
                  </ul>
                </div>
              </td>
              <td>
                <input data-file-id="${
                  file.id
                }" type="checkbox" class="toggle isPublic-toggle" ${
        file.isPublic ? "checked" : ""
      } />
              </td>
            </tr>
      
      
      
      `;
    }
    const delete_btns = document.querySelectorAll(".delete-btn");
    const isPublic_toggles = document.querySelectorAll(".isPublic-toggle");
    const public_url_copy_btns = document.querySelectorAll(
      ".public-url-copy-btn"
    );

    delete_btns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        // const path = e.target.dataset.fullpath;
        // const fileRef = ref(storage, path);
        const fileId = e.target.dataset.fileId;

        await deleteDoc(doc(db, "fb_files", fileId));
        console.log("File deleted");
      });
    });

    isPublic_toggles.forEach((toggle) => {
      toggle.addEventListener("change", async (e) => {
        const fileId = e.target.dataset.fileId;
        const isPublic = e.target.checked;
        // console.log(fileId, isPublic);
        await updateDoc(doc(db, "fb_files", fileId), {
          isPublic: isPublic,
        });
        // console.log("File isPublic updated");
      });
    });

    public_url_copy_btns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const fileId = e.target.dataset.fileId;
        const url = `${location.origin}/download/index.html?fileId=${fileId}`;
        console.log(url);
        navigator.clipboard.writeText(url);
        alert("Sharable link copied to clipboard");
      });
    });
  });
}
