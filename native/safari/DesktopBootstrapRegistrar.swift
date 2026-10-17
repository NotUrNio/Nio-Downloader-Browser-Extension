import Foundation
import Security
import ServiceManagement
import os

/// Invoked by the desktop shell from Contents/MacOS, never a web message.
@main
enum DesktopBootstrapRegistrar {
    static func verifyCode(at url: URL, requirement: String) throws {
        var code: SecStaticCode?
        guard SecStaticCodeCreateWithPath(url as CFURL, [], &code) == errSecSuccess,
              let code,
              SecStaticCodeCheckValidity(code, [], try BootstrapIPCConfiguration.compileRequirement(requirement)) == errSecSuccess
        else { throw BootstrapIPCError.untrustedProcess }
    }

    static func statusName(_ status: SMAppService.Status) -> String {
        switch status {
        case .notRegistered: "not-registered"
        case .enabled: "enabled"
        case .requiresApproval: "requires-approval"
        case .notFound: "not-found"
        @unknown default: "unknown"
        }
    }

    static func main() {
        let logger = Logger(subsystem: "app.niodownloader.safari.registration", category: "service-management")
        do {
            guard CommandLine.arguments.count == 2,
                  ["--status", "--register", "--unregister"].contains(CommandLine.arguments[1]),
                  (Bundle.main.bundleIdentifier == "app.niodownloader.native" || Bundle.main.bundleIdentifier == "app.motrix.native")
            else { throw BootstrapIPCError.invalidRequest }
            let configuration = try signedBootstrapConfiguration()
            let registrarConfiguration = try BootstrapIPCConfiguration(
                teamIdentifier: configuration.teamIdentifier,
                clientBundleIdentifier: configuration.clientBundleIdentifier,
                serviceBundleIdentifier: "app.niodownloader.safari.registration",
                appGroupIdentifier: configuration.appGroupIdentifier
            )
            try registrarConfiguration.validateCurrentService()
            let bundle = Bundle.main.bundleURL
            let expectedAppId = Bundle.main.bundleIdentifier ?? "app.niodownloader.native"
            try verifyCode(at: bundle, requirement:
                "anchor apple generic and certificate leaf[subject.OU] = \"\(configuration.teamIdentifier)\" and identifier \"\(expectedAppId)\"")
            let serviceExecutable = FileManager.default.fileExists(atPath: bundle.appendingPathComponent("Contents/Library/LaunchServices/NioSafariBootstrap").path)
                ? "Contents/Library/LaunchServices/NioSafariBootstrap"
                : "Contents/Library/LaunchServices/MotrixSafariBootstrap"
            try verifyCode(at: bundle.appendingPathComponent(serviceExecutable),
                           requirement: configuration.serviceSigningRequirement)
            let plistName = FileManager.default.fileExists(atPath: bundle.appendingPathComponent("Contents/Library/LaunchAgents/app.niodownloader.safari.bootstrap.plist").path)
                ? "app.niodownloader.safari.bootstrap.plist"
                : "app.motrix.safari.bootstrap.plist"
            let plist = bundle.appendingPathComponent("Contents/Library/LaunchAgents/\(plistName)")
            guard FileManager.default.fileExists(atPath: plist.path) else { throw BootstrapIPCError.invalidConfiguration }
            let service = SMAppService.agent(plistName: plistName)
            switch CommandLine.arguments[1] {
            case "--register":
                if service.status == .notRegistered || service.status == .notFound { try service.register() }
            case "--unregister":
                if service.status != .notRegistered && service.status != .notFound { try service.unregister() }
            default: break
            }
            let result = try JSONSerialization.data(withJSONObject: ["protocolVersion": 1, "status": statusName(service.status)])
            FileHandle.standardOutput.write(result + Data([10]))
        } catch {
            logger.error("Bootstrap registration command failed: \((error as NSError).code, privacy: .public)")
            FileHandle.standardError.write(Data("bootstrap-registration-failed\n".utf8))
            exit(EXIT_FAILURE)
        }
    }
}
