# Contributing to Koshiro Fashion

Thank you for your interest in contributing to Koshiro Fashion! We love receiving contributions from our community.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to treat one another with respect and kindness.

## 🚀 Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/koshiro-fashion-client.git
    cd koshiro-fashion-client
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```
4.  **Create a branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/amazing-new-feature
    # or
    git checkout -b fix/annoying-bug
    ```

## 💻 Development Workflow

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  **Make your changes**. Please follow our coding standards:
    *   **Style**: Use functional components and React Hooks.
    *   **Types**: Strictly use TypeScript. Avoid `any` whenever possible.
    *   **Styling**: Use Tailwind CSS for styling. Follow the existing Japanese-minimalist aesthetic.
    *   **Components**: Use `shadcn/ui` components from `@/components/ui` where applicable.

3.  **Lint and Format**:
    Ensure your code is clean and formatted.
    ```bash
    npm run lint
    ```

## 🎨 Design Guidelines

*   **Aesthetics**: Maintain the "Koshiro" look—clean, modern, and distinctively premium.
*   **Responsiveness**: Always test your changes on mobile, tablet, and desktop viewports.
*   **Performance**: Avoid unnecessary re-renders. Use `React.memo` and `useCallback` judiciously.

## ✉️ Submitting a Pull Request

1.  **Commit your changes** with descriptive commit messages.
    ```bash
    git commit -m "feat: add immersive product zoom"
    ```
2.  **Push to your fork**:
    ```bash
    git push origin feature/amazing-new-feature
    ```
3.  **Open a Pull Request** (PR) on the original repository.
    *   Provide a clear title and description.
    *   Attach screenshots or videos if you changed the UI.
    *   Link to any relevant issues.

## 🐞 Reporting Bugs

If you find a bug, please create an issue including:
*   Steps to reproduce.
*   Expected behavior vs. actual behavior.
*   Screenshots (if applicable).
*   Browser and OS version.

Thank you for making Koshiro Fashion better! ❤️
