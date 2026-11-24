
// ============================================================
// CAMPUSCONNECT - COMPLETE JAVASCRIPT
// ============================================================

// 1. ADMIN LOGIN
// ============================================================

const ADMIN_ID = "Ngit@123";
const ADMIN_PASSWORD = "Ngit@123";

let isAdminLoggedIn = false;

const EVENT_STORAGE_KEY = "campusConnectEvents";
const REGISTRATION_STORAGE_KEY = "collegeEventRegistrations";
const NOTICE_STORAGE_KEY = "campusConnectCancellationNotices";
const REFUND_STORAGE_KEY = "campusConnectRefunds";
const DEFAULT_EVENTS = [
    {
        id: 1,
        name: "Hackathon 2026",
        category: "technical",
        date: "2026-12-10",
        time: "10:00",
        venue: "Seminar Hall",
        description: "24-hour coding competition",
        seats: 100,
        poster: "images/hackathon.jpg",
        paymentType: "free",
        fee: 0
    },
    {
        id: 2,
        name: "Cultural Fest",
        category: "cultural",
        date: "2026-12-15",
        time: "10:00",
        venue: "College Auditorium",
        description: "Music, dance and cultural performances",
        seats: 200,
        poster: "images/cultural-fest.jpg",
        paymentType: "free",
        fee: 0
    },
    {
        id: 3,
        name: "Cricket Tournament",
        category: "sports",
        date: "2026-12-20",
        time: "09:00",
        venue: "College Ground",
        description: "Inter-department cricket competition",
        seats: 150,
        poster: "images/cricket.jpg",
        paymentType: "free",
        fee: 0
    }
];

function loadStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Storage loading error:", error);
        return fallback;
    }
}
let events = loadStorage(EVENT_STORAGE_KEY, DEFAULT_EVENTS);
let registrations = loadStorage(REGISTRATION_STORAGE_KEY, []);
let cancellationNotices = loadStorage(NOTICE_STORAGE_KEY, []);
let refunds = loadStorage(REFUND_STORAGE_KEY, []);

let editingEventId = null;
let selectedPosterData = "";
let pendingEventDeletionId = null;
let editingRegistrationId = null;

// Normalize older saved records
events = events.map(event => ({
    paymentType: "free",
    fee: 0,
    time: "10:00",
    ...event
}));

registrations = registrations.map(registration => ({
    paymentStatus: "approved",
    transactionId: "",
    ...registration
}));

function saveEvents() {
    try {
        localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(events));
        return true;
    } catch (error) {
        alert("Unable to save events. Browser storage may be full.");
        return false;
    }
}

function saveRegistrations() {
    try {
        localStorage.setItem(
            REGISTRATION_STORAGE_KEY,
            JSON.stringify(registrations)
        );
        return true;
    } catch (error) {
        alert("Unable to save registrations. Browser storage may be full.");
        return false;
    }
}

function saveNotices() {
    try {
        localStorage.setItem(
            NOTICE_STORAGE_KEY,
            JSON.stringify(cancellationNotices)
        );
        return true;
    } catch (error) {
        alert("Unable to save cancellation notices.");
        return false;
    }
}

function saveRefunds() {
    try {
        localStorage.setItem(
            REFUND_STORAGE_KEY,
            JSON.stringify(refunds)
        );
        return true;
    } catch (error) {
        alert("Unable to save refund records.");
        return false;
    }
}


function generateId() {
    return Date.now().toString() +
        Math.random().toString(16).slice(2);
}

function getEventById(id) {
    return events.find(event =>
        String(event.id) === String(id)
    );
}
function getRegistrationMemberCount(registration) {
    return 1 + (registration.teamMembers?.length || 0);
}

function getRegisteredAttendeeCount(eventId) {
    return registrations
        .filter(registration =>
            String(registration.eventId) === String(eventId) &&
            registration.paymentStatus !== "rejected"
        )
        .reduce((total, registration) => {
            return total + getRegistrationMemberCount(registration);
        }, 0);
}
function getAvailableSeats(eventId) {
    const event = getEventById(eventId);

    if (!event) return 0;

    const registeredCount = getRegisteredAttendeeCount(eventId);
    const totalSeats = Number(event.seats) || 0;

    return Math.max(0, totalSeats - registeredCount);
}

function showMessage(message, type = "success") {
    const element = document.getElementById("registrationMessage");

    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.style.color = type === "error" ? "#b83245" : "green";
}

function showAdminMessage(message, type = "success") {
    const element = document.getElementById("adminEventMessage");
    if (!element) return;

    element.textContent = message;
    element.style.color = type === "error" ? "#b83245" : "green";
}
// ============================================================
// 2. VIEW MANAGEMENT AND ADMIN LOGIN
// ============================================================


// Show Student View
function showStudentView() {
    const studentView = document.getElementById("studentView");
    const adminLoginView = document.getElementById("adminLoginView");
    const adminView = document.getElementById("adminView");

    if (studentView) studentView.hidden = false;
    if (adminLoginView) adminLoginView.hidden = true;
    if (adminView) adminView.hidden = true;

    displayStudentCancellationNotices();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Show Admin Login
function showAdminLogin() {
    const studentView = document.getElementById("studentView");
    const adminLoginView = document.getElementById("adminLoginView");
    const adminView = document.getElementById("adminView");

    if (studentView) studentView.hidden = true;
    if (adminLoginView) adminLoginView.hidden = false;
    if (adminView) adminView.hidden = true;

    const loginMessage = document.getElementById("loginMessage");
    const loginForm = document.getElementById("adminLoginForm");

    if (loginMessage) {
        loginMessage.textContent = "";
    }

    if (loginForm) {
        loginForm.reset();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Show Admin Dashboard
function showAdminDashboard() {
    if (!isAdminLoggedIn) {
        showAdminLogin();
        return;
    }

    const studentView = document.getElementById("studentView");
    const adminLoginView = document.getElementById("adminLoginView");
    const adminView = document.getElementById("adminView");

    if (studentView) studentView.hidden = true;
    if (adminLoginView) adminLoginView.hidden = true;
    if (adminView) adminView.hidden = false;

    updateAdminDashboard();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Handle Admin Login
function handleAdminLogin(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("adminUsername");
    const passwordInput = document.getElementById("adminPassword");
    const loginForm = document.getElementById("adminLoginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!usernameInput || !passwordInput) {
        console.error("Admin login fields not found.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === ADMIN_ID && password === ADMIN_PASSWORD) {

        isAdminLoggedIn = true;

        if (loginForm) {
            loginForm.reset();
        }

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        showAdminDashboard();

    } else {

        if (loginMessage) {
            loginMessage.textContent =
                "Invalid Admin ID or Password.";
        }
    }
}


// Admin Logout
function logoutAdmin() {
    isAdminLoggedIn = false;

    resetAdminEventForm();
    closeCancellationPanel();
    showStudentView();
}

// ============================================================
// 3. POSTER PREVIEW
// ============================================================

function handlePosterPreview() {
    const input = document.getElementById("eventPoster");
    const preview = document.getElementById("posterPreview");
    const file = input.files[0];

    if (!file) {
        selectedPosterData = "";
        preview.hidden = true;
        preview.removeAttribute("src");
        return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        alert("Please select a JPG, PNG or WEBP image.");
        input.value = "";
        selectedPosterData = "";
        preview.hidden = true;
        return;
    }

    if (file.size > 1024 * 1024) {
        alert("Poster size must be less than 1 MB.");
        input.value = "";
        selectedPosterData = "";
        preview.hidden = true;
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        selectedPosterData = event.target.result;
        preview.src = selectedPosterData;
        preview.hidden = false;
    };

    reader.onerror = function() {
        alert("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
}

// ============================================================
// 4. EVENT PAYMENT TYPE FIELD
// ============================================================

function updateEventFeeField() {
    const type = document.getElementById("eventPaymentType").value;
    const feeInput = document.getElementById("eventFee");

    feeInput.hidden = type !== "paid";
    feeInput.required = type === "paid";

    if (type === "free") {
        feeInput.value = 0;
    } else if (!feeInput.value || Number(feeInput.value) <= 0) {
        feeInput.value = "";
    }
}

// ============================================================
// 5. DISPLAY EVENTS
// ============================================================

function displayEvents(eventList) {
    const grid = document.getElementById("eventGrid");
    if (!grid) return;

    grid.replaceChildren();

    if (eventList.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No events found.";
        grid.appendChild(message);
        return;
    }

    eventList.forEach(event => {
        const card = document.createElement("div");
        card.className = "event-card";

        if (event.poster) {
            const poster = document.createElement("img");
            poster.src = event.poster;
            poster.alt = event.name + " poster";
            poster.className = "event-poster";
            poster.onerror = () => poster.style.display = "none";
            card.appendChild(poster);
        }

        const title = document.createElement("h3");
        title.textContent = event.name;

        const category = document.createElement("p");
        category.textContent = "Category: " + event.category;

        const date = document.createElement("p");
        date.textContent = "Date: " + event.date;

        const time = document.createElement("p");
        time.textContent = "Time: " + (event.time || "10:00");

        const venue = document.createElement("p");
        venue.textContent = "Venue: " + event.venue;

        const description = document.createElement("p");
        description.textContent = event.description;

        const seats = document.createElement("p");
        seats.textContent = "Available Seats: " + getAvailableSeats(event.id);

        const price = document.createElement("p");
        price.textContent = event.paymentType === "paid"
            ? "Paid Event: ₹" + event.fee
            : "Free Event";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Register Now";
        button.dataset.eventId = event.id;

        if (getAvailableSeats(event.id) <= 0) {
            button.disabled = true;
            button.textContent = "Fully Booked";
        }

        card.append(
            title,
            category,
            date,
            time,
            venue,
            description,
            seats,
            price,
            button
        );

        grid.appendChild(card);
    });
}

// ============================================================
// 6. SEARCH AND FILTER
// ============================================================

function searchEvents() {
    const category = document.getElementById("categoryFilter");
    const search = document.getElementById("searchInput");

    if (!category || !search) return;

    const selectedCategory = category.value;
    const value = search.value.toLowerCase().trim();

    const filtered = events.filter(event => {
        const matchesCategory =
            selectedCategory === "all" ||
            event.category === selectedCategory;

        const text = [
            event.name,
            event.description,
            event.venue,
            event.category
        ].join(" ").toLowerCase();

        return matchesCategory && text.includes(value);
    });

    displayEvents(filtered);
}

// ============================================================
// 7. REGISTRATION DROPDOWN AND TEAM REGISTRATION
// ============================================================

function populateEventDropdown() {
    const select = document.getElementById("eventSelect");
    if (!select) return;

    const previousValue = select.value;
    select.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select an event";
    select.appendChild(defaultOption);

    events.forEach(event => {
        const option = document.createElement("option");
        option.value = event.id;
        option.textContent = event.name +
            (event.paymentType === "paid"
                ? " - ₹" + event.fee
                : " - Free");

        select.appendChild(option);
    });

    if (events.some(event => String(event.id) === previousValue)) {
        select.value = previousValue;
    }

    updateStudentPaymentPanel();
}


// Show or hide team registration fields
function updateRegistrationType() {
    const type = document.getElementById("registrationType").value;

    const teamNameField = document.getElementById("teamNameField");
    const teamMembersSection = document.getElementById("teamMembersSection");
    const teamName = document.getElementById("teamName");

    const isTeam = type === "team";

    teamNameField.hidden = !isTeam;
    teamMembersSection.hidden = !isTeam;

    teamName.required = isTeam;

    updateStudentPaymentPanel();
}


// Update team size display
function updateTeamMemberCount() {
    const container = document.getElementById("teamMembersFields");

    const count =
        container.querySelectorAll(".team-member-fields").length;

    document.getElementById("teamMemberCount").textContent =
        `Total team size: ${count + 1}/5 (including team leader)`;

    document.getElementById("addTeamMemberBtn").disabled = count >= 4;
}


// Add a new team member
function addTeamMember() {
    const container = document.getElementById("teamMembersFields");

    const currentCount =
        container.querySelectorAll(".team-member-fields").length;

    if (currentCount >= 4) {
        alert("Maximum team size is 5 students, including the team leader.");
        return;
    }

    const memberDiv = document.createElement("div");
    memberDiv.className = "team-member-fields";

    memberDiv.innerHTML = `
        <input
            type="text"
            class="team-member-name"
            placeholder="Member ${currentCount + 2} Name"
            required
        >

        <input
            type="text"
            class="team-member-roll"
            placeholder="Member ${currentCount + 2} Roll Number"
            required
        >

        <select class="team-member-department" required>
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="CSM">CSM</option>
            <option value="MECH">MECH</option>
            <option value="ECE">ECE</option>
        </select>

        <button type="button" class="remove-team-member">
            Remove Member
        </button>
    `;

    container.appendChild(memberDiv);

    memberDiv.querySelector(".remove-team-member")
        .addEventListener("click", () => {
            memberDiv.remove();
            updateTeamMemberCount();
            updateStudentPaymentPanel();
        });

    updateTeamMemberCount();
    updateStudentPaymentPanel();
}

// ============================================================
// 8. STUDENT PAYMENT PANEL
// ============================================================

function updateStudentPaymentPanel() {
    const select = document.getElementById("eventSelect");
    const panel = document.getElementById("studentPaymentPanel");
    const amount = document.getElementById("paymentAmountText");
    const transaction = document.getElementById("paymentTransactionId");

    if (!select || !panel) return;

    const event = getEventById(select.value);

    const registrationType =
        document.getElementById("registrationType")?.value || "individual";

    const teamMemberCount =
        document.querySelectorAll("#teamMembersFields .team-member-fields").length;

    const totalStudents =
        registrationType === "team" ? teamMemberCount + 1 : 1;

    if (event && event.paymentType === "paid") {
        const totalFee = Number(event.fee) * totalStudents;

        panel.hidden = false;
        amount.textContent =
            `Registration Fee: ₹${event.fee} × ${totalStudents} students = ₹${totalFee}`;

        transaction.required = true;
    } else {
        panel.hidden = true;
        amount.textContent = "";

        transaction.required = false;
        transaction.value = "";
    }
}


// ============================================================
// 9. ADMIN EVENT FORM
// ============================================================

function resetAdminEventForm() {
    const form = document.getElementById("adminEventForm");
    if (!form) return;

    form.reset();

    editingEventId = null;
    selectedPosterData = "";

    document.getElementById("posterPreview").hidden = true;
    document.getElementById("posterPreview").removeAttribute("src");

    document.getElementById("eventPoster").required = true;

    document.getElementById("saveEventBtn").textContent = "Add Event";
    document.getElementById("cancelEventEditBtn").hidden = true;
    document.getElementById("adminFormHeading").textContent = "Add New Event";
    document.getElementById("adminEventMessage").textContent = "";

    updateEventFeeField();
}

function handleAdminEventSubmit(event) {
    event.preventDefault();

    if (!isAdminLoggedIn) {
        alert("Please log in as administrator.");
        return;
    }

    const name = document.getElementById("eventName").value.trim();
    const category = document.getElementById("eventCategory").value;
    const date = document.getElementById("eventDate").value;
    const time = document.getElementById("eventTime").value;
    const venue = document.getElementById("eventVenue").value.trim();
    const seats = Number(document.getElementById("eventSeats").value);
    const description =
        document.getElementById("eventDescription").value.trim();

    const paymentType =
        document.getElementById("eventPaymentType").value;

    const fee = paymentType === "paid"
        ? Number(document.getElementById("eventFee").value)
        : 0;

    const posterInput = document.getElementById("eventPoster");

    if (
        !name || !category || !date || !time || !venue ||
        !description || !Number.isInteger(seats) || seats < 1
    ) {
        showAdminMessage("Please enter valid details in all fields.", "error");
        return;
    }

    if (paymentType === "paid" && (!Number.isFinite(fee) || fee <= 0)) {
        showAdminMessage("Enter a valid registration fee.", "error");
        return;
    }

    if (date < new Date().toISOString().slice(0, 10)) {
        showAdminMessage("Event date cannot be in the past.", "error");
        return;
    }

    const existingEvent = editingEventId !== null
        ? getEventById(editingEventId)
        : null;

    if (editingEventId !== null && !existingEvent) {
        alert("Event not found.");
        resetAdminEventForm();
        return;
    }

    if (!existingEvent && !posterInput.files.length) {
        showAdminMessage("Please upload an event poster.", "error");
        return;
    }

    const poster = selectedPosterData ||
        (existingEvent ? existingEvent.poster : "");

    if (!poster) {
        showAdminMessage("Please upload an event poster.", "error");
        return;
    }

    const registeredCount = existingEvent
        ? registrations.filter(registration =>
            Number(registration.eventId) === Number(existingEvent.id) &&
            registration.paymentStatus !== "rejected"
        ).length
        : 0;

    if (existingEvent && seats < registeredCount) {
        showAdminMessage(
            "Seats cannot be less than existing registrations.",
            "error"
        );
        return;
    }

    const oldEvents = JSON.stringify(events);
    const oldRegistrations = JSON.stringify(registrations);

    const eventData = {
        name,
        category,
        date,
        time,
        venue,
        seats,
        description,
        poster,
        paymentType,
        fee
    };

    if (existingEvent) {
        Object.assign(existingEvent, eventData);

        registrations.forEach(registration => {
            if (Number(registration.eventId) === Number(existingEvent.id)) {
                registration.eventName = name;
            }
        });
    } else {
        events.push({
            id: generateId(),
            ...eventData
        });
    }

    if (!saveEvents()) {
        events = JSON.parse(oldEvents);
        registrations = JSON.parse(oldRegistrations);
        return;
    }

    if (!saveRegistrations()) {
        events = JSON.parse(oldEvents);
        registrations = JSON.parse(oldRegistrations);
        saveEvents();
        return;
    }

    const wasEditing = Boolean(existingEvent);

    resetAdminEventForm();
    refreshEventDisplays();

    alert(wasEditing
        ? "Event updated successfully!"
        : "New event added successfully!");
}

// ============================================================
// 10. EDIT EVENT
// ============================================================

function editEvent(eventId) {
    if (!isAdminLoggedIn) return;

    const event = getEventById(eventId);
    if (!event) return;

    document.getElementById("eventName").value = event.name;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time || "10:00";
    document.getElementById("eventVenue").value = event.venue;
    document.getElementById("eventSeats").value = event.seats;
    document.getElementById("eventDescription").value = event.description;

    document.getElementById("eventPaymentType").value =
        event.paymentType || "free";

    document.getElementById("eventFee").value = event.fee || 0;

    updateEventFeeField();

    editingEventId = event.id;
    selectedPosterData = "";

    document.getElementById("eventPoster").required = false;

    const preview = document.getElementById("posterPreview");
    preview.src = event.poster;
    preview.hidden = false;

    document.getElementById("saveEventBtn").textContent = "Update Event";
    document.getElementById("cancelEventEditBtn").hidden = false;
    document.getElementById("adminFormHeading").textContent = "Edit Event";

    document.getElementById("adminEventForm").scrollIntoView({
        behavior: "smooth"
    });
}

// ============================================================
// 11. EVENT CANCELLATION BY ADMIN
// ============================================================

function deleteEvent(eventId) {
    if (!isAdminLoggedIn) return;

    const event = getEventById(eventId);
    if (!event) return;

    pendingEventDeletionId = event.id;

    const count = registrations.filter(registration =>
        String(registration.eventId) === String(event.id)
    ).length;

    document.getElementById("cancellationEventName").textContent =
        "You are cancelling: " + event.name +
        ". This will affect " + count + " student registration(s).";

    document.getElementById("cancellationReason").value = "";
    document.getElementById("cancellationMessage").textContent = "";

    document.getElementById("eventCancellationPanel").hidden = false;

    document.getElementById("eventCancellationPanel").scrollIntoView({
        behavior: "smooth"
    });
}


function closeCancellationPanel() {
    const panel = document.getElementById("eventCancellationPanel");
    if (panel) panel.hidden = true;

    const reason = document.getElementById("cancellationReason");
    if (reason) reason.value = "";

    const message = document.getElementById("cancellationMessage");
    if (message) message.textContent = "";

    pendingEventDeletionId = null;
}


function confirmEventCancellation() {
    if (!isAdminLoggedIn) return;

    const event = getEventById(pendingEventDeletionId);

    if (!event) {
        alert("Event not found.");
        closeCancellationPanel();
        return;
    }

    const reasonInput = document.getElementById("cancellationReason");
    const message = document.getElementById("cancellationMessage");

    const reason = reasonInput.value.trim();

    if (!reason) {
        message.textContent = "Please provide a reason.";
        message.style.color = "#b83245";
        return;
    }

    if (!confirm("Are you sure you want to cancel " + event.name + "?")) {
        return;
    }

    // Back up existing data
    const oldEvents = JSON.stringify(events);
    const oldRegistrations = JSON.stringify(registrations);
    const oldNotices = JSON.stringify(cancellationNotices);
    const oldRefunds = JSON.stringify(refunds);

    // Find registrations for this event
    const eventRegistrations = registrations.filter(registration =>
        String(registration.eventId) === String(event.id)
    );

    // Create pending refunds for paid registrations
    const newRefunds = eventRegistrations
        .filter(registration =>
            registration.paymentStatus === "approved" &&
            Number(registration.paymentAmount) > 0
        )
        .map(registration => ({
            id: generateId(),
            eventId: event.id,
            eventName: event.name,
            registrationId: registration.id,
            teamName: registration.teamName || "",
            studentName: registration.name,
            rollNumber: registration.rollNumber,
            department: registration.department,
            teamMembers: registration.teamMembers || [],
            totalAttendees: getRegistrationMemberCount(registration),
            transactionId: registration.transactionId || "",
            paymentAmount: Number(registration.paymentAmount),
            refundStatus: "Pending",
            cancellationReason: reason,
            createdAt: new Date().toLocaleString()
        }));

    refunds.push(...newRefunds);

    // Create cancellation announcement
    const newNotice = {
        id: generateId(),
        eventName: event.name,
        eventDate: event.date,
        reason: reason,
        cancellationDate: new Date().toLocaleString()
    };

    // Delete the event
    events = events.filter(item =>
        String(item.id) !== String(event.id)
    );

    // Remove registrations for this event
    registrations = registrations.filter(registration =>
        String(registration.eventId) !== String(event.id)
    );

    cancellationNotices.push(newNotice);

    // Save all changes
    const eventsSaved = saveEvents();
    const registrationsSaved = saveRegistrations();
    const noticesSaved = saveNotices();
    const refundsSaved = saveRefunds();

    // Restore original data if saving fails
    if (!eventsSaved || !registrationsSaved ||
        !noticesSaved || !refundsSaved) {

        events = JSON.parse(oldEvents);
        registrations = JSON.parse(oldRegistrations);
        cancellationNotices = JSON.parse(oldNotices);
        refunds = JSON.parse(oldRefunds);

        saveEvents();
        saveRegistrations();
        saveNotices();
        saveRefunds();

        alert("Cancellation could not be completed. Please try again.");
        return;
    }

    if (String(editingEventId) === String(event.id)) {
        resetAdminEventForm();
    }

    closeCancellationPanel();
    refreshEventDisplays();

    alert(
        "Event cancelled successfully. " +
        newRefunds.length +
        " pending refund record(s) created. Students will be notified."
    );
}


// ============================================================
// 12. STUDENT CANCELLATION NOTICES
// ============================================================

function displayStudentCancellationNotices() {

    // Only show notifications in the student dashboard
    const studentView = document.getElementById("studentView");

    if (!studentView || studentView.hidden) return;

    // Do not create duplicate popups
    if (document.getElementById("cancellationPopup")) return;

    if (!cancellationNotices.length) return;

    // Get the latest cancellation announcement
    const notice = cancellationNotices[cancellationNotices.length - 1];

    // Create popup overlay
    const overlay = document.createElement("div");
    overlay.id = "cancellationPopup";
    overlay.className = "cancellation-popup-overlay";

    const popup = document.createElement("div");
    popup.className = "cancellation-popup";

    const icon = document.createElement("div");
    icon.className = "cancellation-popup-icon";
    icon.textContent = "!";

    const heading = document.createElement("h2");
    heading.textContent = "Event Cancellation Notice";

    const eventName = document.createElement("h3");
    eventName.textContent = notice.eventName;

    const date = document.createElement("p");
    date.textContent = "Scheduled Date: " + notice.eventDate;

    const reason = document.createElement("p");
    reason.textContent = "Reason: " + notice.reason;

const info = document.createElement("p");
info.className = "cancellation-popup-info";
info.textContent =
    "We apologize for the inconvenience. Please check the dashboard for other upcoming events.";

const refundInfo = document.createElement("p");
refundInfo.className = "cancellation-popup-info";
refundInfo.textContent =
    "Amount paid will be returned shortly.";


    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "cancellation-popup-button";
    closeButton.textContent = "Got it";

    closeButton.addEventListener("click", function () {
        overlay.remove();

        // Clear the notification so it does not appear again
        cancellationNotices = [];

        try {
            localStorage.removeItem(NOTICE_STORAGE_KEY);
        } catch (error) {
            console.error("Unable to clear cancellation notice:", error);
        }
    });
popup.append(
    icon,
    heading,
    eventName,
    date,
    reason,
    info,
    refundInfo,
    closeButton
);

    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

// ============================================================
// 13. ADMIN EVENT LIST
// ============================================================

function displayAdminEvents() {
    const list = document.getElementById("adminEventList");
    if (!list) return;

    list.replaceChildren();

    if (!events.length) {
        const message = document.createElement("p");
        message.textContent = "No events available. Add a new event.";
        list.appendChild(message);
        return;
    }

    events.forEach(event => {
        const item = document.createElement("div");
        item.className = "admin-event-card";

        const poster = document.createElement("img");
        poster.src = event.poster || "";
        poster.alt = event.name + " poster";
        poster.onerror = () => poster.style.display = "none";

        const heading = document.createElement("h3");
        heading.textContent = event.name;

        const details = document.createElement("p");
        details.textContent =
            "Category: " + event.category +
            " | Date: " + event.date +
            " | Time: " + (event.time || "10:00") +
            " | Venue: " + event.venue;

        const fee = document.createElement("p");
        fee.textContent = event.paymentType === "paid"
            ? "Paid Event | Fee: ₹" + event.fee
            : "Free Event";

        const seats = document.createElement("p");
        seats.textContent =
            "Available seats: " + getAvailableSeats(event.id) +
            " / " + event.seats;

        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Edit";
        edit.dataset.editEvent = event.id;

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Cancel Event";
        cancel.dataset.deleteEvent = event.id;

        item.append(poster, heading, details, fee, seats, edit, cancel);
        list.appendChild(item);
    });
}

function handleAdminEventListClick(event) {
    const edit = event.target.closest("[data-edit-event]");
    const cancel = event.target.closest("[data-delete-event]");

    if (edit) editEvent(edit.dataset.editEvent);
    if (cancel) deleteEvent(cancel.dataset.deleteEvent);
}

// ============================================================
// 14. REGISTRATION DEADLINE / 24-HOUR CANCELLATION RULE
// ============================================================

function isWithinCancellationDeadline(event) {
    if (!event) return true;

    const start = new Date(
        event.date + "T" + (event.time || "10:00") + ":00"
    );

    const now = new Date();
    const remaining = start.getTime() - now.getTime();

    return remaining <= 24 * 60 * 60 * 1000;
}

function cancelStudentRegistration(id) {
    const registration = registrations.find(item => item.id === id);

    if (!registration) {
        alert("Registration not found.");
        return;
    }

    const event = getEventById(registration.eventId);

    if (!event) {
        alert("Event not found.");
        return;
    }

    if (isWithinCancellationDeadline(event)) {
        alert(
            "Cancellation is not allowed within the final 24 hours before the event."
        );
        return;
    }

    if (!confirm("Are you sure you want to cancel this registration?")) {
        return;
    }

    const oldRegistrations = [...registrations];

    registrations = registrations.filter(item => item.id !== id);

    if (!saveRegistrations()) {
        registrations = oldRegistrations;
        return;
    }

    refreshEventDisplays();
    displayRegistrations();

    showMessage("Registration cancelled successfully.");
}

// ============================================================
// 15. STUDENT REGISTRATION
// ============================================================

function addRegistration(
    name,
    rollNumber,
    department,
    eventId,
    transactionId,
    teamName = "",
    teamMembers = []
) {
    const event = getEventById(eventId);

    if (!event) {
        showMessage("Please select a valid event.", "error");
        return false;
    }

    // Include the leader and all team members
    const allStudents = [
        { name, rollNumber, department },
        ...teamMembers
    ];

    // Validate team size
    if (allStudents.length > 5) {
        showMessage("A team can have a maximum of 5 students.", "error");
        return false;
    }

    // Validate team member details
    const invalidMember = allStudents.some(student =>
        !student.name?.trim() ||
        !student.rollNumber?.trim() ||
        !student.department
    );

    if (invalidMember) {
        showMessage("Please complete all student details.", "error");
        return false;
    }

    // Check duplicate roll numbers within this registration
    const submittedRollNumbers = allStudents.map(student =>
        student.rollNumber.trim().toLowerCase()
    );

    if (new Set(submittedRollNumbers).size !== submittedRollNumbers.length) {
        showMessage("Duplicate roll numbers found in your registration.", "error");
        return false;
    }

    // Check whether any student is already registered for this event
    const existingRollNumbers = registrations
        .filter(registration =>
            Number(registration.eventId) === Number(event.id) &&
            registration.paymentStatus !== "rejected"
        )
        .flatMap(registration => [
            registration.rollNumber,
            ...(registration.teamMembers || []).map(member => member.rollNumber)
        ])
        .map(roll => String(roll).trim().toLowerCase());

    const alreadyRegistered = submittedRollNumbers.some(roll =>
        existingRollNumbers.includes(roll)
    );

    if (alreadyRegistered) {
        showMessage(
            "One or more students are already registered for this event.",
            "error"
        );
        return false;
    }

    // Check seats for the entire team
    if (getAvailableSeats(event.id) < allStudents.length) {
        showMessage(
            "Not enough seats available for your entire team.",
            "error"
        );
        return false;
    }

    // Validate payment
    if (event.paymentType === "paid" && !transactionId.trim()) {
        showMessage("Please enter your payment transaction ID.", "error");
        return false;
    }

    const totalFee =
        event.paymentType === "paid"
            ? Number(event.fee) * allStudents.length
            : 0;

    const registration = {
        id: generateId(),
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        department,
        teamName: teamName.trim(),
        teamMembers: teamMembers.map(member => ({
            name: member.name.trim(),
            rollNumber: member.rollNumber.trim(),
            department: member.department
        })),
        totalAttendees: allStudents.length,
        paymentAmount: totalFee,
        eventId: event.id,
        eventName: event.name,
        registrationDate: new Date().toLocaleDateString(),
        transactionId: transactionId.trim(),
        paymentStatus: event.paymentType === "paid"
            ? "pending"
            : "approved"
    };

    registrations.push(registration);

    if (!saveRegistrations()) {
        registrations.pop();
        return false;
    }

    displayRegistrations();
    displayEvents(events);
    updateAdminDashboard();

    if (event.paymentType === "paid") {
        showMessage(
            "Payment details submitted. Your registration is pending admin verification."
        );
    } else {
        showMessage("Registration successful! Your QR pass is ready.");
    }

    return true;
}

// ============================================================
// 16. QR CODE GENERATION
// ============================================================

function generateRegistrationQR(registration, container) {
    if (!container) return;

    container.replaceChildren();

    if (registration.paymentStatus !== "approved") {
        const message = document.createElement("p");

        message.textContent = registration.paymentStatus === "pending"
            ? "QR pass will be generated after payment verification."
            : "Payment was rejected. Please contact the administrator.";

        container.appendChild(message);
        return;
    }

    if (typeof QRCode === "undefined") {
        const error = document.createElement("p");
        error.textContent =
            "QR library could not load. Check your internet connection and refresh.";
        container.appendChild(error);
        return;
    }

    new QRCode(container, {
        text: registration.id,
        width: 160,
        height: 160,
        colorDark: "#172448",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ============================================================
// 17. DOWNLOAD EVENT PASS
// ============================================================

function downloadRegistrationPass(registrationId) {
    const registration = registrations.find(item =>
        item.id === registrationId
    );

    if (!registration) {
        alert("Registration not found.");
        return;
    }

    if (registration.paymentStatus !== "approved") {
        alert("Your registration pass is not available yet.");
        return;
    }

    const card = Array.from(
        document.querySelectorAll(".registration-card")
    ).find(item => item.dataset.registrationId === registrationId);

    if (!card) {
        alert("Registration card not found.");
        return;
    }

    const qrContainer = card.querySelector(".registration-qr");
    const qrCanvas = qrContainer?.querySelector("canvas");
    const qrImage = qrContainer?.querySelector("img");

    let qrSource = qrCanvas;

    if (!qrSource && qrImage && qrImage.complete && qrImage.naturalWidth) {
        qrSource = qrImage;
    }

    if (!qrSource) {
        alert("QR code is not ready. Please try again.");
        return;
    }

    const event = getEventById(registration.eventId);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 1000;
    canvas.height = 560;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 1000, 560);

    context.fillStyle = "#172448";
    context.fillRect(0, 0, 1000, 115);

    context.fillStyle = "#ffffff";
    context.font = "bold 38px Arial";
    context.fillText("CampusConnect", 45, 55);

    context.font = "19px Arial";
    context.fillText("OFFICIAL EVENT REGISTRATION PASS", 45, 88);

    context.fillStyle = "#172448";
    context.font = "bold 29px Arial";
    context.fillText(registration.eventName, 45, 180);

    context.font = "22px Arial";
    context.fillStyle = "#26365e";

    context.fillText("Student: " + registration.name, 45, 245);
    context.fillText("Roll Number: " + registration.rollNumber, 45, 295);
    context.fillText("Department: " + registration.department, 45, 345);
    context.fillText("Date: " + (event?.date || "N/A"), 45, 395);
    context.fillText("Venue: " + (event?.venue || "N/A"), 45, 445);

    context.font = "16px Arial";
    context.fillStyle = "#788197";
    context.fillText("Registration ID: " + registration.id, 45, 510);

    try {
        context.drawImage(qrSource, 735, 190, 200, 200);
    } catch (error) {
        alert("Unable to prepare the QR pass.");
        return;
    }

    context.fillStyle = "#172448";
    context.font = "bold 19px Arial";
    context.textAlign = "center";
    context.fillText("SCAN YOUR PASS", 835, 425);

    const link = document.createElement("a");
    link.download = "CampusConnect-Pass-" +
        registration.rollNumber + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// ============================================================
// 18. DISPLAY STUDENT REGISTRATIONS
// ============================================================

function displayRegistrations() {
    const list = document.getElementById("registrationList");
    if (!list) return;

    list.replaceChildren();

    if (!registrations.length) {
        const message = document.createElement("p");
        message.textContent = "No registrations yet.";
        list.appendChild(message);
        return;
    }

    registrations.forEach(registration => {
        const card = document.createElement("div");
        card.className = "registration-card";
        card.dataset.registrationId = registration.id;

        const heading = document.createElement("h3");
        heading.textContent = registration.teamName
            ? "Team: " + registration.teamName
            : registration.name;

        const leader = document.createElement("p");
        leader.textContent =
            "Team Leader: " + registration.name;

        const roll = document.createElement("p");
        roll.textContent =
            "Roll Number: " + registration.rollNumber;

        const department = document.createElement("p");
        department.textContent =
            "Department: " + registration.department;

        const eventName = document.createElement("p");
        eventName.textContent =
            "Event: " + registration.eventName;

        const date = document.createElement("p");
        date.textContent =
            "Registered on: " + registration.registrationDate;

        const teamMembers = document.createElement("div");

        if (registration.teamMembers?.length) {
            const memberHeading = document.createElement("h4");
            memberHeading.textContent = "Team Members";

            teamMembers.appendChild(memberHeading);

            registration.teamMembers.forEach((member, index) => {
                const memberInfo = document.createElement("p");

                memberInfo.textContent =
                    `${index + 2}. ${member.name} | Roll Number: ${member.rollNumber} | Department: ${member.department}`;

                teamMembers.appendChild(memberInfo);
            });
        }

        const totalStudents = document.createElement("p");
        totalStudents.textContent =
            "Total Students: " + getRegistrationMemberCount(registration);

        const paymentAmount = document.createElement("p");
        paymentAmount.textContent =
            "Total Fee: ₹" + (registration.paymentAmount ?? 0);

        const status = document.createElement("p");
        status.textContent =
            "Payment Status: " + registration.paymentStatus.toUpperCase();

        const passHeading = document.createElement("h4");
        passHeading.textContent = "Your Event QR Pass";

        const qr = document.createElement("div");
        qr.className = "registration-qr";

        const download = document.createElement("button");
        download.type = "button";
        download.textContent = "Download Event Pass";
        download.dataset.downloadId = registration.id;
        download.hidden = registration.paymentStatus !== "approved";

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Cancel Registration";
        cancel.dataset.cancelRegistration = registration.id;

        const event = getEventById(registration.eventId);

        if (event && isWithinCancellationDeadline(event)) {
            cancel.disabled = true;
            cancel.title =
                "Cancellation is closed within 24 hours of the event.";
        }

        card.append(
            heading,
            leader,
            roll,
            department,
            eventName,
            date,
            teamMembers,
            totalStudents,
            paymentAmount,
            status,
            passHeading,
            qr,
            download,
            cancel
        );

        list.appendChild(card);

        generateRegistrationQR(registration, qr);
    });
}


// ============================================================
// 19. ADMIN PAYMENT VERIFICATION
// ============================================================

function displayAdminPayments() {
    const list = document.getElementById("adminPaymentList");
    if (!list) return;

    list.replaceChildren();

    const pending = registrations.filter(registration =>
        registration.paymentStatus === "pending"
    );

    if (!pending.length) {
        const message = document.createElement("p");
        message.className = "no-payments-message";
        message.textContent = "No pending payments to verify.";
        list.appendChild(message);
        return;
    }

    pending.forEach(registration => {
        const card = document.createElement("div");
        card.className = "admin-payment-card";

        const heading = document.createElement("h3");
        heading.textContent = registration.teamName
            ? "Team: " + registration.teamName
            : registration.name;

        const leader = document.createElement("p");
        leader.textContent = "Team Leader: " + registration.name;

        const roll = document.createElement("p");
        roll.textContent = "Roll Number: " + registration.rollNumber;

        const event = document.createElement("p");
        event.textContent = "Event: " + registration.eventName;

        const members = document.createElement("div");

        if (registration.teamMembers?.length) {
            const memberHeading = document.createElement("h4");
            memberHeading.textContent = "Team Members:";

            members.appendChild(memberHeading);

            registration.teamMembers.forEach((member, index) => {
                const memberInfo = document.createElement("p");

                memberInfo.textContent =
                    `${index + 2}. ${member.name} | ${member.rollNumber} | ${member.department}`;

                members.appendChild(memberInfo);
            });
        }

        const totalStudents = document.createElement("p");
        totalStudents.textContent =
            "Total Students: " + getRegistrationMemberCount(registration);

        const transaction = document.createElement("p");
        transaction.textContent =
            "Transaction ID: " + registration.transactionId;

        const fee = document.createElement("p");
        fee.textContent =
            "Total Team Payment: ₹" +
            (registration.paymentAmount ??
                Number(getEventById(registration.eventId)?.fee || 0));

        const status = document.createElement("span");
        status.className = "payment-pending";
        status.textContent = "PENDING";

        const actions = document.createElement("div");
        actions.className = "payment-actions";

        const approve = document.createElement("button");
        approve.type = "button";
        approve.textContent = "Approve Payment";
        approve.className = "approve-payment-btn";
        approve.dataset.approvePayment = registration.id;

        const reject = document.createElement("button");
        reject.type = "button";
        reject.textContent = "Reject Payment";
        reject.className = "reject-payment-btn";
        reject.dataset.rejectPayment = registration.id;

        actions.append(approve, reject);

        card.append(
            heading,
            leader,
            roll,
            event,
            members,
            totalStudents,
            transaction,
            fee,
            status,
            actions
        );

        list.appendChild(card);
    });
}

// ============================================================
// REFUND MANAGEMENT
// ============================================================

function displayAdminRefunds() {
    const refundList = document.getElementById("adminRefundList");

    if (!refundList) return;

    refundList.replaceChildren();

    if (!refunds.length) {
        const message = document.createElement("p");
        message.textContent = "No refunds available.";
        refundList.appendChild(message);
        return;
    }

    refunds.forEach(refund => {
        const card = document.createElement("div");
        card.className = "refund-card";

        const heading = document.createElement("h3");
        heading.textContent = refund.teamName
            ? refund.teamName
            : refund.studentName;

        const event = document.createElement("p");
        event.textContent = "Event: " + refund.eventName;

        const leader = document.createElement("p");
        leader.textContent =
            "Team Leader: " + refund.studentName +
            " (" + refund.rollNumber + ")";

        const members = document.createElement("p");
        members.textContent = "Total Students: " +
            (refund.totalAttendees || 1);

        const amount = document.createElement("p");
        amount.textContent =
            "Refund Amount: ₹" + refund.paymentAmount;

        const transaction = document.createElement("p");
        transaction.textContent =
            "Transaction ID: " + (refund.transactionId || "Not available");

        const status = document.createElement("p");
        status.textContent = "Refund Status: " + refund.refundStatus;

        card.append(
            heading,
            event,
            leader,
            members,
            amount,
            transaction,
            status
        );

        if (refund.teamMembers?.length) {
            const teamDetails = document.createElement("p");

            teamDetails.textContent = "Team Members: " +
                refund.teamMembers.map(member =>
                    `${member.name} (${member.rollNumber})`
                ).join(", ");

            card.appendChild(teamDetails);
        }

        if (refund.refundStatus === "Pending") {
            const button = document.createElement("button");

            button.type = "button";
            button.textContent = "Mark as Processed";
            button.className = "refund-process-button";
            button.dataset.processRefund = refund.id;

            card.appendChild(button);
        }

        refundList.appendChild(card);
    });
}


// Mark refund as processed
function processRefund(refundId) {
    if (!isAdminLoggedIn) return;

    const refund = refunds.find(item =>
        String(item.id) === String(refundId)
    );

    if (!refund || refund.refundStatus !== "Pending") return;

    if (!confirm("Have you actually completed this refund?")) return;

    const oldRefunds = JSON.stringify(refunds);

    refund.refundStatus = "Processed";
    refund.processedAt = new Date().toLocaleString();

    if (!saveRefunds()) {
        refunds = JSON.parse(oldRefunds);
        return;
    }

    displayAdminRefunds();

    alert("Refund marked as processed successfully!");
}


// Refund button listener
function handleRefundClick(event) {
    const button = event.target.closest("[data-process-refund]");

    if (!button) return;

    processRefund(button.dataset.processRefund);
}

function verifyPayment(registrationId, decision) {
    if (!isAdminLoggedIn) return;

    if (!["approved", "rejected"].includes(decision)) return;

    const registration = registrations.find(item =>
        item.id === registrationId
    );

    if (!registration || registration.paymentStatus !== "pending") {
        alert("Pending registration not found.");
        return;
    }

    const oldStatus = registration.paymentStatus;
    registration.paymentStatus = decision;

    if (!saveRegistrations()) {
        registration.paymentStatus = oldStatus;
        return;
    }

    displayRegistrations();
    displayAdminPayments();
    updateAdminDashboard();

    alert(decision === "approved"
        ? "Payment approved. Student QR pass generated."
        : "Payment rejected.");
}

function handleAdminPaymentClick(event) {
    const approve = event.target.closest("[data-approve-payment]");
    const reject = event.target.closest("[data-reject-payment]");

    if (approve && confirm("Approve this payment?")) {
        verifyPayment(approve.dataset.approvePayment, "approved");
    }

    if (reject && confirm("Reject this payment?")) {
        verifyPayment(reject.dataset.rejectPayment, "rejected");
    }
}


// ============================================================
// 20. REGISTRATION FORM SUBMISSION
// ============================================================

function handleRegistration(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const rollNumber = document.getElementById("rollNumber").value.trim();
    const department = document.getElementById("department").value;
    const eventId = document.getElementById("eventSelect").value;

    const transactionId =
        document.getElementById("paymentTransactionId").value.trim();

    const registrationType =
        document.getElementById("registrationType").value;

    const teamName =
        document.getElementById("teamName").value.trim();

    // Validate leader details
    if (!name || !rollNumber || !department || !eventId) {
        showMessage("Please fill in all required fields.", "error");
        return;
    }

    if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
        showMessage("Please enter a valid student name.", "error");
        return;
    }

    if (rollNumber.length < 3) {
        showMessage("Roll number must contain at least 3 characters.", "error");
        return;
    }

    // Collect team members
    const teamMembers = [];

    if (registrationType === "team") {
        if (!teamName) {
            showMessage("Please enter your team name.", "error");
            return;
        }

        const memberFields = document.querySelectorAll(
            "#teamMembersFields .team-member-fields"
        );

        if (memberFields.length < 1) {
            showMessage("Please add at least one team member.", "error");
            return;
        }

        for (const field of memberFields) {
            const memberName =
                field.querySelector(".team-member-name").value.trim();

            const memberRoll =
                field.querySelector(".team-member-roll").value.trim();

            const memberDepartment =
                field.querySelector(".team-member-department").value;

            if (!memberName || !memberRoll || !memberDepartment) {
                showMessage("Please complete all team member details.", "error");
                return;
            }

            if (!/^[a-zA-Z\s.'-]+$/.test(memberName)) {
                showMessage("Please enter a valid team member name.", "error");
                return;
            }

            if (memberRoll.length < 3) {
                showMessage("Every roll number must contain at least 3 characters.", "error");
                return;
            }

            teamMembers.push({
                name: memberName,
                rollNumber: memberRoll,
                department: memberDepartment
            });
        }
    }

    const eventDetails = getEventById(eventId);

    if (!eventDetails) {
        showMessage("Please select a valid event.", "error");
        return;
    }

    if (
        eventDetails.paymentType === "paid" &&
        transactionId.length < 6
    ) {
        showMessage("Please enter a valid transaction ID.", "error");
        return;
    }

    // Save registration
    const success = addRegistration(
        name,
        rollNumber,
        department,
        eventId,
        transactionId,
        registrationType === "team" ? teamName : "",
        teamMembers
    );

    if (success) {
        document.getElementById("registrationForm").reset();

        // Remove old team member fields
        document.getElementById("teamMembersFields").innerHTML = "";

        updateTeamMemberCount();
        updateRegistrationType();
        updateStudentPaymentPanel();
    }
}


// ============================================================
// 21. STUDENT REGISTRATION BUTTONS
// ============================================================

function handleRegistrationListClick(event) {
    const download = event.target.closest("[data-download-id]");
    const cancel = event.target.closest("[data-cancel-registration]");

    if (download) {
        downloadRegistrationPass(download.dataset.downloadId);
    }

    if (cancel) {
        cancelStudentRegistration(cancel.dataset.cancelRegistration);
    }
}

function handleEventCardClick(event) {
    const button = event.target.closest("[data-event-id]");
    if (!button) return;

    const select = document.getElementById("eventSelect");
    const form = document.getElementById("registrationForm");

    if (!select || !form) return;

    select.value = button.dataset.eventId;
    updateStudentPaymentPanel();

    form.scrollIntoView({ behavior: "smooth" });
}

// ============================================================
// 22. ADMIN DASHBOARD STATISTICS
// ============================================================

function updateAdminDashboard() {
    const totalEvents = document.getElementById("totalEvents");
    const totalRegistrations = document.getElementById("totalRegistrations");
    const totalSeats = document.getElementById("totalSeats");
    const adminList = document.getElementById("adminRegistrationList");

    if (totalEvents) {
        totalEvents.textContent = events.length;
    }

    // Count individual students, not registration records
    if (totalRegistrations) {
        totalRegistrations.textContent = registrations
            .filter(registration => registration.paymentStatus !== "rejected")
            .reduce((total, registration) => {
                return total + getRegistrationMemberCount(registration);
            }, 0);
    }

    if (totalSeats) {
        totalSeats.textContent = events.reduce(
            (total, event) => total + getAvailableSeats(event.id),
            0
        );
    }

   displayAdminEvents();
displayAdminPayments();
displayAdminRefunds();

    if (!adminList) return;

    adminList.replaceChildren();

    const activeRegistrations = registrations.filter(
        registration => registration.paymentStatus !== "rejected"
    );

    if (!activeRegistrations.length) {
        const message = document.createElement("p");
        message.textContent = "No student registrations yet.";
        adminList.appendChild(message);
        return;
    }

    activeRegistrations.forEach(registration => {
        const item = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = registration.teamName
            ? registration.teamName + " - " + registration.name
            : registration.name;

        const details = document.createElement("p");
        details.textContent =
            registration.rollNumber + " | " +
            registration.department + " | " +
            registration.eventName;

        item.append(heading, details);

        if (registration.teamMembers?.length) {
            const members = document.createElement("p");

            members.textContent = "Team Members: " +
                registration.teamMembers.map(member =>
                    `${member.name} (${member.rollNumber}, ${member.department})`
                ).join(" | ");

            item.appendChild(members);
        }

        const count = document.createElement("p");
        count.textContent =
            "Total Students: " + getRegistrationMemberCount(registration);

        const status = document.createElement("p");
        status.textContent =
            "Payment Status: " + registration.paymentStatus.toUpperCase();

        item.append(count, status);
        adminList.appendChild(item);
    });
}

// ============================================================
// 23. REFRESH ALL DISPLAYS
// ============================================================

function refreshEventDisplays() {
    displayEvents(events);
    populateEventDropdown();
    searchEvents();
    displayRegistrations();
    updateAdminDashboard();
    displayStudentCancellationNotices();
}

// ============================================================
// 24. INITIALIZE APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("CampusConnect JavaScript initialized successfully!");

    // Initial displays
    displayEvents(events);
    populateEventDropdown();
    displayRegistrations();
    updateAdminDashboard();
    displayStudentCancellationNotices();

    // Set up event date minimum
    const eventDateInput = document.getElementById("eventDate");

    if (eventDateInput) {
        eventDateInput.min = new Date().toISOString().slice(0, 10);
    }

    // Search
    document.getElementById("searchInput")
        ?.addEventListener("input", searchEvents);

    // Category filter
    document.getElementById("categoryFilter")
        ?.addEventListener("change", searchEvents);

    // Registration form
    document.getElementById("registrationForm")
        ?.addEventListener("submit", handleRegistration);

    // Event dropdown
    document.getElementById("eventSelect")
        ?.addEventListener("change", updateStudentPaymentPanel);

    // Student event buttons
    document.getElementById("eventGrid")
        ?.addEventListener("click", handleEventCardClick);

    // Student registration buttons
    document.getElementById("registrationList")
        ?.addEventListener("click", handleRegistrationListClick);

    // Admin event form
    const adminEventForm = document.getElementById("adminEventForm");

    console.log("Admin event form found:", !!adminEventForm);

    if (adminEventForm) {
        adminEventForm.addEventListener("submit", function (event) {
            console.log("Add Event form submitted!");
            handleAdminEventSubmit(event);
        });
    }

    // Event payment type
    document.getElementById("eventPaymentType")
        ?.addEventListener("change", updateEventFeeField);

    // Poster preview
    document.getElementById("eventPoster")
        ?.addEventListener("change", handlePosterPreview);

    // Cancel editing
    document.getElementById("cancelEventEditBtn")
        ?.addEventListener("click", resetAdminEventForm);

    // Admin event list
    document.getElementById("adminEventList")
        ?.addEventListener("click", handleAdminEventListClick);

    // Admin payment verification
    document.getElementById("adminPaymentList")
        ?.addEventListener("click", handleAdminPaymentClick);

    // Admin refund processing
document.getElementById("adminRefundList")
    ?.addEventListener("click", handleRefundClick);
    // Confirm event cancellation
    document.getElementById("confirmEventCancellation")
        ?.addEventListener("click", confirmEventCancellation);

    // Close event cancellation panel
    document.getElementById("cancelEventCancellation")
        ?.addEventListener("click", closeCancellationPanel);

    // Admin login
    document.getElementById("adminLoginButton")
        ?.addEventListener("click", showAdminLogin);

    document.getElementById("adminLoginForm")
        ?.addEventListener("submit", handleAdminLogin);

    // Show/hide password
    document.getElementById("togglePassword")
        ?.addEventListener("click", function () {

            const input = document.getElementById("adminPassword");

            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    this.textContent = "Hide";
                } else {
                    input.type = "password";
                    this.textContent = "Show";
                }
            }
        });

    // Admin logout
    document.getElementById("adminLogoutButton")
        ?.addEventListener("click", logoutAdmin);

    // Back to student view
    document.querySelectorAll('[data-view="student"]')
        .forEach(button => {
            button.addEventListener("click", showStudentView);
        });

    // Registration type dropdown
    document.getElementById("registrationType")
        ?.addEventListener("change", updateRegistrationType);

    // Add team member button
    document.getElementById("addTeamMemberBtn")
        ?.addEventListener("click", addTeamMember);

    // Initial fee field state
    updateEventFeeField();

    // Initial registration setup
    updateRegistrationType();
    updateTeamMemberCount();

    // Initial student view
    showStudentView();

    console.log("All CampusConnect event listeners attached successfully!");
});
