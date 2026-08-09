PasScanApp is a full-stack Electron application for reading documents, demonstrating the integration of scanners based on two different processing workflows.

🔴 Problem

Business can require different scanner solutions depending on operational needs, cost efficiency, and the feasibility of using third-party libraries.

🟢 Solution

A Scanner Factory and Proxy pattern were implemented to provide a unified interface between the client application and different scanner implementations.

🔵 Result

An extensible and maintainable foundation that allows new scanners to be integrated with minimal changes to the client-side logic.