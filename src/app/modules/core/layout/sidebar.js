(function () {
    'use strict';

    angular
        .module('qorDash.core')
        .controller('QorSidebarController', $QorSidebarController)
        .controller('SidebarStubController', function () {
        })
        .directive('qorSidebarContainer', $QorSidebarContainer)
        .directive('qorSidebar', $QorSidebar)
        .provider('$qorSidebar', $QorSidebarProvider)
        .directive('qorSidebarGroupHeading', $QorSidebarGroupHeading)
        .directive('propertyController', $PropertyController)
        .directive('bindHtmlCompile', $BindHtmlCompile);

    function $QorSidebarController($scope, $rootScope, $qorSidebar) {
        var groups = this.groups = $scope.groups = $qorSidebar.sortedGroups();

        function selectGroup(selectedGroup) {
            groups.forEach(function (group) {
                if (group.active && group !== selectedGroup) {
                    group.active = false;
                }
            });
            selectedGroup.active = true;
        }

        function toggleGroup(group) {
            if (group.active) {
                group.active = false;
            } else {
                selectGroup(group);
            }
        }

        function resetStates() {
            groups.forEach(function (group) {
                group.active = false;
            });
        }

        $scope.selectGroup = selectGroup;
        $scope.toggleGroup = toggleGroup;
        $scope.resetStates = resetStates;
        $scope.appTitle = $qorSidebar.getTitle();

        $scope.hasActiveGroup = function () {
            return groups.reduce(function (acc, group) {
                return acc || group.active;
            }, false);
        };

        $scope.activeGroup = function () {
            var activeGroup;
            groups.forEach(function (group) {
                if (group.active) {
                    activeGroup = group;
                }
            });
            return activeGroup;
        };

        $rootScope.$on('$stateChangeSuccess', resetStates);
    }

    function $QorSidebar($rootScope, ICON_URL) {
        return {
            restrict: 'EA',
            replace: true,
            scope: true,
            controller: 'QorSidebarController',
            template: '<nav class="qor-sidebar" ng-class="{ opened: hasActiveGroup() }">' +
                '<header class="qor-sidebar-groups">' +
                '<div class="qor-logo">' +
                '<a href="/"><img src="'+ ICON_URL +'" height="50" width="50"></a>' +
                '</div>' +
                // TODO: create a template for sidebar
                '<loading-indicator></loading-indicator>' +
                '<ul class="qor-sidebar-nav">' +
                '<li ng-repeat="group in groups" has-permission="{{group.id}}.read" ng-class="{\'user-label\' : group.title==\'Logout\'}" ui-sref-active="active" bind-html-compile="group.content" ng-class="{ active: group.active }" ng-click="group.templateUrl && toggleGroup(group)"></li>' +
                '</ul>' +
                '</header>' +
                '</nav>'
        };
    }

    function $QorSidebarGroupHeading() {
        return {
            restrict: 'EA',
            template: '<i class="group-icon" ng-if="iconClass" ng-class="iconClass"></i>' +
                '<span class="group-nav-heading">{{qorSidebarGroupHeading}}</span>',
            scope: {
                qorSidebarGroupHeading: '@',
                iconClass: '@'
            },
            link: function (scope, iElement) {
                iElement.addClass('group-nav');
            }
        };
    }

    function $BindHtmlCompile($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
            }
        };
    }

    function $QorSidebarProvider() {
        var groups = {};
        var title = 'qorio';

        this.config = function (id, options) {
            if (!groups.id) {
                groups[id] = options;
            } else {
                throw Error('Group with id=' + id + ' already exist.');
            }
        };

        this.setTitle = function (titleTpl) {
            title = titleTpl;
        };

        function _groups() {
            return Object.keys(groups).map(function (key) {
                var v = angular.extend({
                    id: key
                }, groups[key]);

                if (!v.controller) {
                    v.controller = 'SidebarStubController';
                }
                return v;
            });
        }

        function $QorSidebarService($rootScope) {
            var expanded = true;
            return {
                sortedGroups: function () {
                    //return _groups();
                    // TODO ??
                    return _groups().sort(function (g1, g2) {
                        return (g1.nav || 0) - (g2.nav || 0);
                    });
                },
                isExpanded: function () {
                    return expanded;
                },
                showSidebar: function () {
                    expanded = true;
                    $rootScope.$broadcast('qorSidebarStateChange', expanded);
                },
                hideSidebar: function () {
                    expanded = false;
                    $rootScope.$broadcast('qorSidebarStateChange', expanded);
                },
                toggleSidebar: function () {
                    expanded = !expanded;
                    $rootScope.$broadcast('qorSidebarStateChange', expanded);
                },
                getTitle: function () {
                    return title;
                }
            };
        }

        this.$get = $QorSidebarService;
    }

    function $QorSidebarContainer() {
        return {
            restrict: 'EA',
            link: function (scope, $el, attrs) {
                if (!$el.find('[qor-sidebar]').length) {
                    throw Error('qor-sidebar should be defined inside');
                }
                if (!$el.find('[qor-content]').length) {
                    throw Error('qor-content should be defined inside');
                }

                $el.find('[qor-content]').addClass('qor-content');

                scope.$on('qorSidebarStateChange', function (newVal) {
                    $el.toggleClass('qor-sidebar-expanded', newVal);
                });
            }
        };
    }

    function $PropertyController($controller) {
        return {
            restrict: 'A',
            scope: true,
            priority: 500,
            compile: function () {
                return function (scope, $element, attrs) {
                    var controller = $controller(scope.$eval(attrs.propertyController), { $scope: scope });
                    $element.data('$ngControllerController', controller);
                    $element.children().data('$ngControllerController', controller);
                };
            }
        };
    }
})();
