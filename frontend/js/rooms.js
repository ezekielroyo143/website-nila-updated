const roomsGrid = document.getElementById("roomsGrid");
const roomModal = document.getElementById("roomModal");
const modalClose = document.getElementById("modalClose");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalAmenities = document.getElementById("modalAmenities");
const modalInfo = document.getElementById("modalInfo");
const modalPrice = document.getElementById("modalPrice");
const modalReserve = document.getElementById("modalReserve");

let rooms = [];

function peso(value) {
  return (
    "₱" + Number(value).toLocaleString("en-PH", { maximumFractionDigits: 0 })
  );
}

function renderRooms() {
  roomsGrid.innerHTML = rooms
    .map(
      (room) => `
        <article class="room-card">
            <img src="${room.image_url}" alt="${room.name}">
            <div class="room-card-body">
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="price">${peso(room.price)} / night</div>
                <button class="btn btn-primary details-btn" data-id="${room.id}">View Details</button>
            </div>
        </article>
    `,
    )
    .join("");

  document.querySelectorAll(".details-btn").forEach((button) => {
    button.addEventListener("click", () => openRoom(Number(button.dataset.id)));
  });
}

function openRoom(id) {
  const room = rooms.find((item) => Number(item.id) === id);
  if (!room) return;

  modalImage.src = room.image_url;
  modalImage.alt = room.name;
  modalTitle.textContent = room.name;
  modalDescription.textContent = room.description;
  modalInfo.textContent = `${room.max_guests} guests • ${room.beds} • ${room.size} • ${room.view}`;
  modalPrice.textContent = `${peso(room.price)} / night`;
  modalAmenities.innerHTML = room.amenities
    .map((item) => `<span class="amenity">${item}</span>`)
    .join("");
  modalReserve.href = `./reservation.html?room=${encodeURIComponent(room.slug)}`;
  roomModal.classList.add("show");
}

function closeRoom() {
  roomModal.classList.remove("show");
}

modalClose.addEventListener("click", closeRoom);
roomModal.addEventListener("click", (event) => {
  if (event.target === roomModal) closeRoom();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeRoom();
});

async function loadRooms() {
  const { data, error } = await supabaseClient
    .from("rooms")
    .select("*")
    .eq("available", true)
    .order("price", { ascending: true });

  if (error) {
    roomsGrid.innerHTML = `<p class="message error">Could not load rooms: ${error.message}</p>`;
    return;
  }

  console.log("ROOM DATA:", data);

  rooms = data || [];
  renderRooms();
}

loadRooms();
