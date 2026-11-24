import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./features/auth/api/authApi", () => ({
  logout: vi.fn().mockResolvedValue(),
}));
vi.mock("./features/blog/components/PublicArticleList", () => ({
  default: ({ onNavigate }) => (
    <button onClick={() => onNavigate("/posts/hello%20world")}>
      page-home
    </button>
  ),
}));
vi.mock("./features/blog/components/PublicArticleDetail", () => ({
  default: ({ slug, dark }) => <div>{`page-post:${slug}:${dark}`}</div>,
}));
vi.mock("./features/blog/components/AuthorDashboard", () => ({
  default: () => <div>page-author</div>,
}));
vi.mock("./features/admin/components/AdminDashboard", () => ({
  default: () => <div>page-admin</div>,
}));
vi.mock("./features/auth/components/AuthPage", () => ({
  default: ({ mode, onSuccess }) => (
    <div>
      {`page-auth:${mode}`}
      <button onClick={() => onSuccess({ username: "bob", role: "member" })}>
        auth-success
      </button>
    </div>
  ),
}));
vi.mock("./features/auth/modals/AuthModal", () => ({
  default: ({ open, onClose, onSuccess, onNavigate }) =>
    open ? (
      <div>
        modal-open
        <button onClick={onClose}>modal-close</button>
        <button onClick={() => onSuccess({ username: "amy", role: "member" })}>
          modal-success
        </button>
        <button onClick={() => onNavigate("/register")}>modal-register</button>
      </div>
    ) : null,
}));

import { logout } from "./features/auth/api/authApi";
import App from "./App";

const member = { id: 1, username: "bob", role: "member" };
const admin = { id: 2, username: "root", role: "admin" };

const start = (path, user) => {
  window.history.replaceState(null, "", path);
  if (user) localStorage.setItem("delcom_user", JSON.stringify(user));
  return render(<App />);
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.documentElement.className = "";
});

describe("App routing", () => {
  it("renders the public home for / and /public", () => {
    start("/");
    expect(screen.getByText("page-home")).toBeInTheDocument();
  });

  it("treats /public as home", () => {
    start("/public");
    expect(screen.getByText("page-home")).toBeInTheDocument();
  });

  it("decodes the slug of /posts/:slug", async () => {
    start("/posts/hello%20world");
    expect(
      await screen.findByText("page-post:hello world:false"),
    ).toBeInTheDocument();
  });

  it("shows 404 for unknown paths and goes home", async () => {
    start("/nope");
    expect(screen.getByText("404")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Kembali ke beranda" }),
    );
    expect(screen.getByText("page-home")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("pushes history entries when pages navigate", async () => {
    start("/");

    await userEvent.click(screen.getByText("page-home"));

    expect(window.location.pathname).toBe("/posts/hello%20world");
    expect(
      await screen.findByText("page-post:hello world:false"),
    ).toBeInTheDocument();
  });

  it("follows browser back/forward (popstate)", async () => {
    start("/");
    act(() => {
      window.history.pushState(null, "", "/register");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(await screen.findByText("page-auth:register")).toBeInTheDocument();
  });
});

describe("App guards", () => {
  it("redirects guests from /author and /admin to /login", async () => {
    start("/author");
    expect(await screen.findByText("page-auth:login")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });

  it("redirects guests from /admin to /login", async () => {
    start("/admin");
    expect(await screen.findByText("page-auth:login")).toBeInTheDocument();
  });

  it("shows the author workspace to logged-in users", async () => {
    start("/author", member);
    expect(await screen.findByText("page-author")).toBeInTheDocument();
  });

  it("keeps members out of /admin", async () => {
    start("/admin", member);
    expect(await screen.findByText("page-home")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });

  it("lets admins into /admin", async () => {
    start("/admin", admin);
    expect(await screen.findByText("page-admin")).toBeInTheDocument();
  });

  it("redirects logged-in users away from /login and /register", async () => {
    start("/login", member);
    expect(await screen.findByText("page-author")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/author");
  });

  it("redirects logged-in users away from /register", async () => {
    start("/register", member);
    expect(await screen.findByText("page-author")).toBeInTheDocument();
  });
});

describe("App session & theme", () => {
  it("logs in from the auth page and lands on /author", async () => {
    start("/login");
    await userEvent.click(await screen.findByText("auth-success"));

    expect(await screen.findByText("page-author")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Keluar \(bob\)/ }),
    ).toBeInTheDocument();
  });

  it("opens the login modal from the navbar, logs in or closes it", async () => {
    start("/");

    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await userEvent.click(screen.getByText("modal-close"));
    expect(screen.queryByText("modal-open")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await userEvent.click(screen.getByText("modal-register"));
    expect(await screen.findByText("page-auth:register")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await userEvent.click(screen.getByText("modal-success"));
    expect(await screen.findByText("page-author")).toBeInTheDocument();
    expect(screen.queryByText("modal-open")).toBeNull();
  });

  it("logs out and returns home", async () => {
    start("/author", member);
    expect(await screen.findByText("page-author")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Keluar/ }));

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(await screen.findByText("page-home")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeInTheDocument();
  });

  it("toggles the dark theme", async () => {
    start("/");

    await userEvent.click(screen.getByRole("button", { name: "Ganti tema" }));

    expect(document.documentElement).toHaveClass("dark");
  });
});
