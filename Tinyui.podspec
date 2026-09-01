require "json"
require "pathname"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

components = {
  "Menu" => {
    :source_files => "ios/Menu/**/*.{h,m,mm,swift,cpp}",
    :definition => "TINYUI_FEATURE_MENU=1",
    :frameworks => ["UIKit"],
  },
  "Popover" => {
    :source_files => "ios/Popover/**/*.{h,m,mm,swift,cpp}",
    :definition => "TINYUI_FEATURE_POPOVER=1",
    :frameworks => ["UIKit"],
  },
}

configured_components = nil
app_path = ENV["APP_PATH"]

unless app_path.nil? || app_path.empty?
  app_root = Pathname.new(app_path)
  unless app_root.absolute?
    app_root = Pod::Config.instance.installation_root.join(app_root)
  end

  app_package_path = app_root.join("package.json").cleanpath
  if app_package_path.file?
    app_package = JSON.parse(File.read(app_package_path))
    tinyui_config = app_package["react-native-tinyui"]

    unless tinyui_config.nil?
      unless tinyui_config.is_a?(Hash)
        raise "react-native-tinyui in #{app_package_path} must be an object"
      end

      configured_components = tinyui_config["components"]
      unless configured_components.is_a?(Array) && configured_components.all? { |component| component.is_a?(String) }
        raise "react-native-tinyui.components in #{app_package_path} must be an array of strings"
      end
    end
  end
end

selected_component_names = configured_components.nil? ? components.keys : configured_components.uniq

unknown_components = selected_component_names - components.keys
unless unknown_components.empty?
  raise "Unknown react-native-tinyui components: #{unknown_components.join(', ')}. " \
    "Available components: #{components.keys.join(', ')}"
end

if defined?(Pod::UI)
  selection = selected_component_names.empty? ? "Core only" : selected_component_names.join(", ")
  source = configured_components.nil? ? "defaults" : "package.json"
  Pod::UI.puts "[TinyUI] Enabled components from #{source}: #{selection}"
end

selected_components = selected_component_names.map { |name| components.fetch(name) }
source_files = ["ios/Core/**/*.{h,m,mm,swift,cpp}"] + selected_components.map { |component| component[:source_files] }
definitions = selected_components.map { |component| component[:definition] }
frameworks = selected_components.flat_map { |component| component.fetch(:frameworks, []) }.uniq

Pod::Spec.new do |s|
  s.name         = "Tinyui"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "17.0" }
  s.source       = { :git => "https://github.com/luoxuhai/react-native-tinyui.git", :tag => "#{s.version}" }

  s.source_files = source_files
  s.private_header_files = ["ios/Core/**/*.h", "ios/Menu/**/*.h", "ios/Popover/**/*.h"]
  s.swift_version = "5.0"
  s.frameworks = frameworks unless frameworks.empty?
  s.pod_target_xcconfig = {
    "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) #{definitions.join(' ')}",
  }

  install_modules_dependencies(s)
end
