// // activity.js (Frontend)
// document.addEventListener("DOMContentLoaded", async () => {
//     const userId = localStorage.getItem("userId");
//     if (!userId) {
//         alert("Please log in.");
//         window.location.href = "login.html";
//         return;
//     }

//     try {
//         const res = await fetch(`http://localhost:9000/activity/${userId}`);
//         const activities = await res.json();

//         const feed = document.getElementById("activity-feed");

//         activities.forEach(activity => {
//             const div = document.createElement("div");
//             div.className = "activity-item";
//             div.innerHTML = `
//           <span>${activity.message}</span>
//           <span>${activity.timeAgo}</span>
//         `;
//             feed.appendChild(div);
//         });

//     } catch (error) {
//         console.error("Failed to load activity:", error);
//     }
// });