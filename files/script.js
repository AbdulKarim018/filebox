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
  uploadBytes,
  where,
} from "../firebase.js";

const logout_btn = document.getElementById("logout_btn");
const user_img = document.getElementById("user_img");
const file_input = document.getElementById("file_input");
const files_table_body = document.getElementById("files_table_body");

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
});

async function getFiles() {
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
              <th></th>
              <td>${file.name.split("__")[0]}</td>
              <td>${file.size} bytes</td>
              <td>
                <div class="dropdown">
                  <div tabindex="0" role="button" class="btn btn-sm">...</div>
                  <ul
                    tabindex="0"
                    class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow"
                  >
                    <li><a href="${file.url}" target="_blank" >Download</a></li>
                    <li><button class="btn btn-ghost" disabled>Copy Sharable Link</button></li>
                    <li><button class="text-red-400 delete-btn" data-file-fullpath="${
                      file.fullPath
                    }" data-file-id="${file.id}">Delete</button></li>
                  </ul>
                </div>
              </td>
              <td>
                <input disabled type="checkbox" class="toggle" ${
                  file.isPublic ? "checked" : ""
                } />
              </td>
            </tr>
      
      
      
      `;
    }
    const delete_btns = document.querySelectorAll(".delete-btn");

    delete_btns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        // const path = e.target.dataset.fullpath;
        // const fileRef = ref(storage, path);
        const fileId = e.target.dataset.fileId;

        await deleteDoc(doc(db, "fb_files", fileId));
        console.log("File deleted");
      });
    });
  });
}
